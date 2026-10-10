using System.IO;
using System.Text.Json.Nodes;
using KVRandom;

static void Check(bool condition, string name)
{
  if (!condition) throw new Exception("FAILED: " + name);
  Console.WriteLine("PASS: " + name);
}

var defaults = ConfigStore.CreateDefaults();
Check(ConfigStore.Flag(defaults["allowRepeatDraw"]), "repeat enabled by default");
Check(defaults["recruitPools"]!.AsArray().Count == 4, "legacy default recruit pools");
var normalized = ConfigStore.Normalize(ConfigStore.ParseYaml("""
    floatingButton:
      sizePercent: -1
      transparencyPercent: '150'
      alwaysOnTop: 'no'
      mode: invalid
    pickCountDialog:
      defaultCount: 99
      bgmVolume: 2
    """));
Check(ConfigStore.Number(normalized["floatingButton"]?["sizePercent"]) == 0, "size lower bound");
Check(ConfigStore.Number(normalized["floatingButton"]?["transparencyPercent"]) == 100, "numeric string upper bound");
Check(!ConfigStore.Flag(normalized["floatingButton"]?["alwaysOnTop"]), "YAML string boolean");
Check(ConfigStore.Text(normalized["floatingButton"]?["mode"]) == "full", "invalid mode fallback");
Check(ConfigStore.Number(normalized["pickCountDialog"]?["defaultCount"]) == 10, "count clamp");
Check(ConfigStore.Number(normalized["pickCountDialog"]?["bgmVolume"]) == 1, "volume clamp");

var students = JsonNode.Parse("""
    [{"name":"Alice","weight":1.7,"avatar":"C:\\图片\\a #1.png","academy":"Abydos"},{"name":"Bob","weight":0}]
    """)!;
var parsed = ConfigStore.ParseStudents(" Alice\r\nBob,Charlie\nAlice\n", students);
Check(ConfigStore.Text(parsed["normalizedText"]) == "Alice\nBob\nCharlie", "list parser deduplicates");
Check(ConfigStore.Number(parsed["studentList"]?[0]?["weight"]) == 1.7, "list parser preserves weights");
Check(ConfigStore.Text(parsed["studentList"]?[0]?["academy"]) == "Abydos", "list parser preserves metadata");

var folder = Path.Combine(Path.GetTempPath(), "KVRandom-tests-" + Guid.NewGuid().ToString("N"));
Directory.CreateDirectory(folder);
try
{
  var store = new ConfigStore(folder);
  File.WriteAllText(store.ListPath, "students:\n  - name: Alice\n    weight: 1.7\n    academy: Abydos\n  - name: Bob\n    weight: 0\n");
  var config = store.Load();
  Check(config["studentList"]!.AsArray().Count == 2, "legacy list.yaml loaded");
  config["recruitConfig"]!["autoSkipVideo"] = true;
  config["floatingButton"]!["position"] = new JsonObject { ["x"] = -1920, ["y"] = 120 };
  config["recruitPools"]![0]!["rateBoostStudents"] = new JsonArray(new JsonObject { ["studentName"] = "Alice", ["boostMultiplier"] = 3 });
  config["studentList"] = parsed["studentList"]!.DeepClone();
  store.Save(config);
  var reload = new ConfigStore(folder).Load();
  Check(reload["studentList"]!.AsArray().Count == 3, "separate list save/reload");
  Check(ConfigStore.Flag(reload["recruitConfig"]?["autoSkipVideo"]), "autoSkipVideo survives save");
  Check(ConfigStore.Number(reload["recruitPools"]?[0]?["rateBoostStudents"]?[0]?["boostMultiplier"]) == 3, "rate boosts survive save");
  Check(ConfigStore.Number(reload["floatingButton"]?["position"]?["x"]) == -1920, "negative monitor coordinates survive save");
  Check(!File.ReadAllText(store.ConfigPath).Contains("studentList:"), "config excludes student list");
  foreach (var (name, hasList, readOnlyList) in new[]
  {
    ("read-only config with existing list", true, false),
    ("read-only config without existing list", false, false),
    ("read-only list", true, true)
  })
  {
    var failureStore = new ConfigStore(Path.Combine(folder, name));
    failureStore.Save(defaults, false);
    if (hasList)
      File.WriteAllText(failureStore.ListPath, "# 原名单注释\r\nstudents:\r\n  - name: Alice\r\n    weight: 1.7\r\n", new System.Text.UTF8Encoding(true));
    var originalConfig = File.ReadAllBytes(failureStore.ConfigPath);
    var originalList = hasList ? File.ReadAllBytes(failureStore.ListPath) : null;
    var readOnlyPath = readOnlyList ? failureStore.ListPath : failureStore.ConfigPath;
    var attributes = File.GetAttributes(readOnlyPath);
    File.SetAttributes(readOnlyPath, attributes | FileAttributes.ReadOnly);
    try
    {
      var draft = ConfigStore.CreateDefaults();
      draft["floatingButton"]!["sizePercent"] = 123;
      draft["studentList"] = parsed["studentList"]!.DeepClone();
      var saveRejected = false;
      try { failureStore.Save(draft); }
      catch (Exception error) when (error is IOException or UnauthorizedAccessException) { saveRejected = true; }
      Check(saveRejected, name + " rejects save");
      Check(File.ReadAllBytes(failureStore.ConfigPath).SequenceEqual(originalConfig), name + " preserves config bytes");
      Check(originalList == null ? !File.Exists(failureStore.ListPath)
          : File.ReadAllBytes(failureStore.ListPath).SequenceEqual(originalList), name + " preserves original list or absence");
      Check(!File.Exists(failureStore.ConfigPath + ".tmp") && !File.Exists(failureStore.ListPath + ".tmp"), name + " removes temporary files");
    }
    finally { File.SetAttributes(readOnlyPath, attributes); }
  }
  var invalid = "floatingButton: [broken";
  File.WriteAllText(store.ConfigPath, invalid);
  var rejected = false;
  try { store.Load(); } catch (YamlDotNet.Core.YamlException) { rejected = true; }
  Check(rejected && File.ReadAllText(store.ConfigPath) == invalid, "invalid YAML is not overwritten");
}
finally { Directory.Delete(folder, true); }

var pickerConfig = ConfigStore.CreateDefaults();
pickerConfig["studentList"] = students.DeepClone();
var picker = new Picker();
var repeated = picker.Pick(pickerConfig, 10);
Check(repeated.Count == 10 && repeated.All(s => ConfigStore.Text(s?["name"]) == "Alice"), "positive weights selected over zero weight");
Check(ConfigStore.Text(repeated[9]?["rarity"]) is "gold" or "pink", "tenth draw pity guarantee");
pickerConfig["allowRepeatDraw"] = false;
var unique = picker.Pick(pickerConfig, 10);
Check(unique.Count == 2 && unique.Select(s => ConfigStore.Text(s?["name"])).Distinct().Count() == 2, "without replacement capped at pool size");
Check(picker.Pick(pickerConfig, 0).Count == 0, "zero draws return empty");
Check(ConfigStore.Text(picker.Select(pickerConfig, "Alice")["academy"]) == "Abydos", "selection metadata");
var missing = false;
try { picker.Select(pickerConfig, "Missing"); } catch (InvalidOperationException) { missing = true; }
Check(missing, "missing selection rejected");
Check(AssetHandler.TryRange("bytes=2-4", 10, out var start, out var end) && start == 2 && end == 4, "media byte range");
Check(AssetHandler.TryRange("bytes=-3", 10, out start, out end) && start == 7 && end == 9, "media suffix range");
Check(!AssetHandler.TryRange("bytes=10-", 10, out _, out _), "invalid media range rejected");
var devUrl = "http://127.0.0.1:5173";
Check(AssetHandler.Url("sound/bgm.mp3") == "https://kvrandom.local/sound/bgm.mp3", "bundled audio uses production URL by default");
Check(AssetHandler.Url("public/sound/bgm.mp3", "https://kvrandom.local") == "https://kvrandom.local/sound/bgm.mp3", "production public asset URL");
Check(AssetHandler.Url("sound/bgm.mp3", devUrl) == devUrl + "/sound/bgm.mp3", "bundled audio uses dev URL");
Check(AssetHandler.Url(" /public\\sound\\button_click.wav ", devUrl + "/") == devUrl + "/sound/button_click.wav", "dev asset path normalization");
foreach (var path in new[] { "http://example.com/audio.mp3", "https://example.com/audio.ogg", "data:audio/wav;base64,AAAA", "blob:http://127.0.0.1:5173/audio" })
  Check(AssetHandler.Url(path, devUrl) == path, "external audio URL preserved: " + path);
foreach (var path in new[] { @"C:\音乐\a #1.wav", @"\\server\share\音乐\a #1.ogg" })
{
  var expected = "https://assets.kvrandom.local/file?path=" + Uri.EscapeDataString(path);
  Check(AssetHandler.Url(path) == expected && AssetHandler.Url(path, devUrl) == expected, "local audio mapping preserved: " + path);
}
Check(UpdateChecker.CompareVersions("v26.5.3", "26.5.3.0") == 0, "version trailing zero");
Check(UpdateChecker.CompareVersions("26.5.3", "26.6.1") < 0, "update version ordering");
Console.WriteLine("All backend checks passed.");
