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
Check(UpdateChecker.CompareVersions("v26.5.3", "26.5.3.0") == 0, "version trailing zero");
Check(UpdateChecker.CompareVersions("26.5.3", "26.6.1") < 0, "update version ordering");
Console.WriteLine("All backend checks passed.");
