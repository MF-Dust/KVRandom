using System.Net.Http;

namespace KVRandom;

public static class UpdateChecker
{
  private static readonly HttpClient Client = CreateClient();
  private static HttpClient CreateClient()
  {
    var client = new HttpClient { Timeout = TimeSpan.FromSeconds(15) };
    client.DefaultRequestHeaders.UserAgent.ParseAdd("KVRandom");
    return client;
  }

  public static int CompareVersions(string left, string right)
  {
    static int[] Parts(string value) => value.Trim().TrimStart('v', 'V').Split('.')
        .Where(part => int.TryParse(part, out _)).Select(int.Parse).ToArray();
    var a = Parts(left); var b = Parts(right);
    for (var i = 0; i < Math.Max(a.Length, b.Length); i++)
    {
      var comparison = (i < a.Length ? a[i] : 0).CompareTo(i < b.Length ? b[i] : 0);
      if (comparison != 0) return comparison;
    }
    return 0;
  }

  public static async Task<JsonObject> Check(string localVersion)
  {
    const string repo = "https://api.github.com/repos/MF-Dust/KVRandom";
    const string web = "https://github.com/MF-Dust/KVRandom";
    var debug = new JsonArray();
    var result = new JsonObject
    {
      ["ok"] = false,
      ["status"] = "error",
      ["title"] = "检查更新失败啦...",
      ["detail"] = "",
      ["localVersion"] = localVersion,
      ["debug"] = debug
    };
    try
    {
      debug.Add($"GET {repo}/releases/latest");
      var release = JsonNode.Parse(await Client.GetStringAsync(repo + "/releases/latest"))!.AsObject();
      result["releaseUrl"] = ConfigStore.Text(release["html_url"], web + "/releases/latest");
      var assets = release["assets"] as JsonArray ?? new JsonArray();
      debug.Add($"assets={assets.Count}");
      var versionAsset = assets.OfType<JsonObject>().FirstOrDefault(asset => ConfigStore.Text(asset["name"]).EndsWith("version.yml", StringComparison.OrdinalIgnoreCase))
          ?? throw new InvalidDataException("发布里缺少 version.yml，老师稍后再试～");
      var versionUrl = ConfigStore.Text(versionAsset["browser_download_url"]);
      debug.Add($"GET {versionUrl}");
      var metadata = ConfigStore.ParseYaml(await Client.GetStringAsync(versionUrl)) as JsonObject
          ?? throw new InvalidDataException("版本描述文件格式不正确");
      var remoteVersion = ConfigStore.Text(metadata["version"], "0.0.0");
      result["remoteVersion"] = remoteVersion;
      debug.Add($"remoteVersion={remoteVersion}");
      var commit = ConfigStore.Text(metadata["commit"]);
      var commitMessage = "";
      if (commit != "")
      {
        result["commitUrl"] = web + "/commit/" + Uri.EscapeDataString(commit);
        var commitApi = repo + "/commits/" + Uri.EscapeDataString(commit);
        debug.Add($"GET {commitApi}");
        try { commitMessage = ConfigStore.Text(JsonNode.Parse(await Client.GetStringAsync(commitApi))?["commit"]?["message"]).Trim(); }
        catch (Exception error) when (error is HttpRequestException or TaskCanceledException or JsonException) { debug.Add(error.Message); }
      }
      var compare = CompareVersions(localVersion, remoteVersion);
      result["ok"] = true;
      result["status"] = compare < 0 ? "update" : compare == 0 ? "ok" : "easter";
      result["title"] = compare < 0 ? $"发现新版本啦：{remoteVersion}！" : compare == 0 ? $"已经是最新版啦：{localVersion}～" : $"咦？{localVersion}";
      result["detail"] = compare > 0 ? "老师的版本比最新发布的还要新呢！好厉害～"
          : commitMessage != "" ? (compare < 0 ? "更新内容：\n" : "当前提交：\n") + commitMessage
          : compare < 0 ? "有新版本可以用哦～" : "不用更新啦～";
    }
    catch (Exception error) when (error is HttpRequestException or TaskCanceledException or JsonException or InvalidDataException or YamlDotNet.Core.YamlException or InvalidOperationException)
    {
      result["detail"] = error.Message;
    }
    return result;
  }
}
