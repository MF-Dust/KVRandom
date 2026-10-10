using System.Globalization;
using System.Reflection;
using YamlDotNet.Core;
using YamlDotNet.RepresentationModel;
using YamlDotNet.Serialization;

namespace KVRandom;

// Keep the existing camelCase wire/YAML schema; the renderer and backend share defaults.
public sealed class ConfigStore
{
  private readonly string directory;
  private JsonObject? cached;
  private (DateTime, long, DateTime, long)? signature;
  private static readonly JsonObject Defaults = ReadDefaults();
  private static readonly Dictionary<string, (double Min, double Max)> Ranges = new()
  {
    ["floatingButton.sizePercent"] = (0, 1000),
    ["floatingButton.transparencyPercent"] = (0, 100),
    ["floatingButton.borderRadiusPercent"] = (0, 50),
    ["floatingButton.clickSoundVolume"] = (0, 1),
    ["floatingButton.dragThresholdPx"] = (0, 48),
    ["pickCountDialog.backgroundDarknessPercent"] = (0, 100),
    ["pickCountDialog.defaultCount"] = (1, 10),
    ["pickCountDialog.bgmVolume"] = (0, 1),
    ["pickCountDialog.exitAnimationMs"] = (0, 3000),
    ["pickResultDialog.gachaSoundVolume"] = (0, 1),
    ["pickResultDialog.backgroundDarknessPercent"] = (0, 100),
    ["pickResultDialog.cardSizePercent"] = (50, 200),
    ["pickResultDialog.flyIntervalMs"] = (0, 1000),
    ["pickResultDialog.revealDelayMs"] = (0, 5000),
    ["pickResultDialog.closeFadeMs"] = (0, 3000),
    ["appearance.cardRadiusPx"] = (0, 28)
  };

  public ConfigStore(string directory) => this.directory = Path.GetFullPath(directory);
  public string ConfigPath => Path.Combine(directory, "config.yml");
  public string ListPath => Path.Combine(directory, "list.yaml");
  public static JsonObject CreateDefaults() => (JsonObject)Defaults.DeepClone();

  private static JsonObject ReadDefaults()
  {
    using var stream = Assembly.GetExecutingAssembly().GetManifestResourceStream("KVRandom.defaults.json")
        ?? throw new InvalidOperationException("缺少默认配置资源");
    return JsonNode.Parse(stream)!.AsObject();
  }

  private static (DateTime, long) Stamp(string path)
  {
    var file = new FileInfo(path);
    return file.Exists ? (file.LastWriteTimeUtc, file.Length) : (DateTime.MinValue, 0);
  }

  public JsonObject Load()
  {
    var (ct, cl) = Stamp(ConfigPath);
    var (lt, ll) = Stamp(ListPath);
    var next = (ct, cl, lt, ll);
    if (cached != null && signature == next) return (JsonObject)cached.DeepClone();
    var raw = File.Exists(ConfigPath) ? File.ReadAllText(ConfigPath) : "";
    var config = Normalize(ParseYaml(raw));
    config["studentList"] = File.Exists(ListPath)
        ? NormalizeStudents(ParseYaml(File.ReadAllText(ListPath))?["students"])
        : new JsonArray();
    // Invalid YAML throws before any write; never replace unreadable user data with defaults.
    var yaml = ConfigYaml(config);
    if (raw != yaml) WriteAtomic(ConfigPath, yaml);
    cached = config;
    (ct, cl) = Stamp(ConfigPath);
    signature = (ct, cl, lt, ll);
    return (JsonObject)config.DeepClone();
  }

  public JsonObject Save(JsonNode? value, bool saveStudents = true)
  {
    var config = Normalize(value);
    var configYaml = ConfigYaml(config);
    var listYaml = saveStudents ? "# 学生名单: name, weight, avatar, academy, club\n" + ToYaml(new JsonObject
    {
      ["students"] = config["studentList"]!.DeepClone()
    }) : null;
    var previousList = saveStudents && File.Exists(ListPath) ? File.ReadAllBytes(ListPath) : null;
    if (listYaml != null) WriteAtomic(ListPath, listYaml);
    try { WriteAtomic(ConfigPath, configYaml); }
    catch (Exception error)
    {
      if (saveStudents)
      {
        try
        {
          if (previousList == null) File.Delete(ListPath);
          else WriteAtomic(ListPath, previousList);
        }
        catch (Exception rollbackError)
        {
          throw new AggregateException("配置保存失败，恢复学生名单也失败", error, rollbackError);
        }
      }
      throw;
    }
    cached = null;
    signature = null;
    return config;
  }

  private static void WriteAtomic(string path, string text) => WriteAtomic(path, System.Text.Encoding.UTF8.GetBytes(text));
  private static void WriteAtomic(string path, byte[] bytes)
  {
    Directory.CreateDirectory(Path.GetDirectoryName(path)!);
    var temp = path + ".tmp";
    try
    {
      File.WriteAllBytes(temp, bytes);
      File.Move(temp, path, true);
    }
    finally { if (File.Exists(temp)) File.Delete(temp); }
  }

  private static string ConfigYaml(JsonObject config)
  {
    var copy = (JsonObject)config.DeepClone();
    copy.Remove("studentList");
    return "# KVRandom 配置；学生名单保存在 list.yaml\n" + ToYaml(copy);
  }

  public static JsonNode? ParseYaml(string text)
  {
    var yaml = new YamlStream();
    yaml.Load(new StringReader(text));
    if (yaml.Documents.Count == 0) return null;
    if (yaml.Documents.Count != 1) throw new InvalidDataException("配置只支持一个 YAML 文档");
    return FromYaml(yaml.Documents[0].RootNode);
  }

  private static JsonNode? FromYaml(YamlNode node) => node switch
  {
    YamlMappingNode map => new JsonObject(map.Children.Select(pair =>
        new KeyValuePair<string, JsonNode?>(((YamlScalarNode)pair.Key).Value ?? "", FromYaml(pair.Value)))),
    YamlSequenceNode sequence => new JsonArray(sequence.Children.Select(FromYaml).ToArray()),
    YamlScalarNode scalar when scalar.Style == ScalarStyle.Plain &&
        (scalar.Value is null or "" or "~" || string.Equals(scalar.Value, "null", StringComparison.OrdinalIgnoreCase)) => null,
    YamlScalarNode scalar => JsonValue.Create(scalar.Value),
    _ => throw new InvalidDataException("不支持的 YAML 数据")
  };

  public static string ToYaml(JsonNode node) => new SerializerBuilder().Build().Serialize(ToPlain(node));
  private static object? ToPlain(JsonNode? node) => node switch
  {
    JsonObject obj => obj.ToDictionary(pair => pair.Key, pair => ToPlain(pair.Value)),
    JsonArray array => array.Select(ToPlain).ToList(),
    null => null,
    _ => JsonSerializer.Deserialize<object>(node.ToJsonString()) is JsonElement value ? value.ValueKind switch
    {
      JsonValueKind.String => value.GetString(),
      JsonValueKind.True => true,
      JsonValueKind.False => false,
      JsonValueKind.Number => value.GetDouble(),
      _ => null
    } : null
  };

  public static string Text(JsonNode? node, string fallback = "") => node is JsonValue ? node.ToString() : fallback;
  public static double Number(JsonNode? node, double fallback = 0) =>
      double.TryParse(Text(node), NumberStyles.Float, CultureInfo.InvariantCulture, out var number) && double.IsFinite(number)
          ? number : fallback;
  public static bool Flag(JsonNode? node, bool fallback = false) => Text(node).Trim().ToLowerInvariant() switch
  {
    "true" or "1" or "yes" => true,
    "false" or "0" or "no" => false,
    _ => fallback
  };

  public static JsonObject Normalize(JsonNode? value)
  {
    var result = (JsonObject)NormalizeNode(value, Defaults, "")!;
    result["studentList"] = NormalizeStudents(value is JsonObject ? value["studentList"] : null);
    if (Text(result["floatingButton"]?["mode"]) is not ("simple" or "full"))
      result["floatingButton"]!["mode"] = "full";
    if (value is JsonObject && value["recruitPools"] is JsonArray pools)
      result["recruitPools"] = new JsonArray(pools.OfType<JsonObject>()
          .Where(pool => Text(pool["id"]) != "" && Text(pool["name"]) != "")
          .Select(NormalizePool).Cast<JsonNode?>().ToArray());
    return result;
  }

  private static JsonNode? NormalizeNode(JsonNode? value, JsonNode? fallback, string path)
  {
    if (fallback is JsonObject obj)
      return new JsonObject(obj.Select(pair => new KeyValuePair<string, JsonNode?>(pair.Key,
          NormalizeNode(value is JsonObject ? value[pair.Key] : null, pair.Value,
              path.Length == 0 ? pair.Key : path + "." + pair.Key))));
    if (fallback is JsonArray array)
    {
      if (path != "pickCountDialog.bgmPaths") return array.DeepClone();
      var paths = value is JsonArray items ? items.OfType<JsonValue>().Select(item => Text(item).Trim()).Where(s => s != "").ToArray()
          : Text(value).Trim() is { Length: > 0 } single ? new[] { single } : Array.Empty<string>();
      return paths.Length > 0 ? new JsonArray(paths.Select(s => (JsonNode?)JsonValue.Create(s)).ToArray()) : array.DeepClone();
    }
    if (fallback == null)
      return value == null || Text(value).Trim() == "" || !double.TryParse(Text(value), NumberStyles.Float, CultureInfo.InvariantCulture, out var pos) || !double.IsFinite(pos)
          ? null : JsonValue.Create((int)Math.Clamp(Math.Round(pos, MidpointRounding.AwayFromZero), int.MinValue, int.MaxValue));
    var kind = JsonSerializer.SerializeToElement(fallback).ValueKind;
    if (kind is JsonValueKind.True or JsonValueKind.False) return JsonValue.Create(Flag(value, Flag(fallback)));
    if (kind == JsonValueKind.Number)
    {
      var number = Number(value, Number(fallback));
      if (path.EndsWith("Ms", StringComparison.Ordinal) || path.EndsWith("defaultCount", StringComparison.Ordinal))
        number = Math.Round(number, MidpointRounding.AwayFromZero);
      if (Ranges.TryGetValue(path, out var range)) number = Math.Clamp(number, range.Min, range.Max);
      return JsonValue.Create(number);
    }
    var text = Text(value, Text(fallback));
    if (path is "fontFamily" or "webConfig.adminAutoStartPath") return JsonValue.Create(text);
    return JsonValue.Create(string.IsNullOrWhiteSpace(text) ? Text(fallback) : text.Trim());
  }

  private static JsonObject NormalizePool(JsonObject pool)
  {
    var result = new JsonObject();
    foreach (var key in new[] { "id", "name", "tabName", "startTime", "endTime", "description", "buttonText1", "buttonText2", "buttonCost1", "buttonCost2" })
      result[key] = Text(pool[key]);
    result["tabType"] = Text(pool["tabType"], "pickup_blue");
    result["gachaType"] = Text(pool["gachaType"], "gacha");
    foreach (var key in new[] { "tabAvatar", "bgVideo", "bgImage" }) result[key] = OptionalText(pool[key]);
    result["rateBoostStudents"] = new JsonArray((pool["rateBoostStudents"] as JsonArray ?? new JsonArray()).OfType<JsonObject>()
        .Where(boost => Text(boost["studentName"]) != "" && Number(boost["boostMultiplier"], 1) >= 1)
        .Select(boost => (JsonNode?)new JsonObject { ["studentName"] = Text(boost["studentName"]), ["boostMultiplier"] = Number(boost["boostMultiplier"], 1) }).ToArray());
    return result;
  }

  private static JsonNode? OptionalText(JsonNode? node) => string.IsNullOrWhiteSpace(Text(node)) ? null : JsonValue.Create(Text(node).Trim());
  public static JsonArray NormalizeStudents(JsonNode? value)
  {
    var result = new JsonArray();
    if (value is not JsonArray students) return result;
    foreach (var item in students)
    {
      var name = Text(item is JsonObject ? item["name"] : item).Trim();
      if (name == "") continue;
      var student = new JsonObject { ["name"] = name, ["weight"] = item is JsonObject ? Number(item["weight"], 1) : 1 };
      foreach (var key in new[] { "avatar", "academy", "club" })
        if (item is JsonObject && OptionalText(item[key]) is { } text) student[key] = text;
      result.Add(student);
    }
    return result;
  }

  public static JsonObject ParseStudents(string rawText, JsonNode? existing)
  {
    var map = NormalizeStudents(existing).OfType<JsonObject>().GroupBy(s => Text(s["name"])).ToDictionary(g => g.Key, g => g.Last());
    var names = rawText.Split(new[] { '\n', '\r', ',' }, StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries).Distinct().ToArray();
    var students = new JsonArray(names.Select(name => map.TryGetValue(name, out var old) ? old.DeepClone()
        : (JsonNode)new JsonObject { ["name"] = name, ["weight"] = 1 }).ToArray());
    return new JsonObject { ["studentList"] = students, ["normalizedText"] = string.Join("\n", names) };
  }
}
