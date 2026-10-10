using System.Windows;
using Microsoft.Web.WebView2.Core;
using Microsoft.Win32;
using Forms = System.Windows.Forms;

namespace KVRandom;

public sealed class DesktopHost : IDisposable
{
#if DEBUG
  public const bool IsDebug = true;
#else
    public const bool IsDebug = false;
#endif
  private readonly ConfigStore store;
  private readonly Picker picker = new();
  private readonly Dictionary<string, BrowserWindow> windows = new();
  private readonly Dictionary<string, Task<BrowserWindow>> loading = new();
  private readonly List<JsonObject> logs = new();
  private readonly Dictionary<string, DateTime> recentLogs = new();
  private readonly AudioController audio;
  private Forms.NotifyIcon? tray;
  private System.Drawing.Icon? trayIcon;
  private JsonArray results = new();
  private long resultToken;
  private string? drawSource;
  private (int X, int Y)? dragStart;
  public bool IsQuitting { get; private set; }
  public Task<CoreWebView2Environment> EnvironmentTask { get; }
  public string WebRoot { get; }
  public string AppUrl { get; }
  public AssetHandler Assets { get; } = new();

  public DesktopHost(ConfigStore store, string? devUrl)
  {
    this.store = store;
    AppUrl = devUrl?.TrimEnd('/') ?? "https://kvrandom.local";
    WebRoot = Path.Combine(AppContext.BaseDirectory, "wwwroot");
    if (devUrl == null && !File.Exists(Path.Combine(WebRoot, "index.html")))
      throw new FileNotFoundException("缺少前端资源，请先执行 npm run build:frontend 再构建后端。");
    Directory.CreateDirectory(WebRoot);
    var profile = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "KVRandom", "WebView2");
    EnvironmentTask = CoreWebView2Environment.CreateAsync(null, profile,
        new CoreWebView2EnvironmentOptions("--autoplay-policy=no-user-gesture-required"));
    audio = new AudioController(() => windows.GetValueOrDefault("floating"), AppUrl);
  }

  public bool IsAppUrl(string value) => Uri.TryCreate(value, UriKind.Absolute, out var uri)
      && string.Equals(uri.GetLeftPart(UriPartial.Authority), AppUrl, StringComparison.OrdinalIgnoreCase);

  public async Task StartAsync()
  {
    var floating = await GetWindow("floating");
    ApplyFloating(store.Load());
    Show(floating);
    SetupTray();
    Log("info", "C# 桌面后端已启动");
  }

  private async Task<BrowserWindow> GetWindow(string label)
  {
    if (loading.TryGetValue(label, out var pending)) return await pending;
    if (windows.TryGetValue(label, out var current)) return current;
    var route = label switch { "pick_count" => "/pick-count", "pick_result" => "/pick-result", "config" => "/config", "recruit" => "/recruit", _ => "" };
    var window = new BrowserWindow(this, label, route);
    windows.Add(label, window);
    var initializing = Initialize(window);
    loading[label] = initializing;
    try { return await initializing; }
    finally { loading.Remove(label); }
  }

  private async Task<BrowserWindow> Initialize(BrowserWindow window)
  {
    try { await window.InitializeAsync(); return window; }
    catch { window.CanClose = true; window.Close(); throw; }
  }

  private static void Show(BrowserWindow window)
  {
    window.Show();
    if (window.Label is "pick_count" or "pick_result") NativeWindow.CoverCurrentMonitor(window);
    if (window.WindowState == WindowState.Minimized) window.WindowState = WindowState.Normal;
    window.Activate();
  }
  private void Hide(string label) { if (windows.TryGetValue(label, out var window)) window.Hide(); }
  private void Close(string label)
  {
    if (windows.TryGetValue(label, out var window)) { window.CanClose = true; window.Close(); }
  }
  private void Emit(string label, string name, object? payload)
  {
    if (windows.TryGetValue(label, out var window) && window.IsReady) window.Emit(name, payload);
  }
  public void WindowClosed(string label) => windows.Remove(label);
  private void ShowFloating() { if (windows.TryGetValue("floating", out var window)) Show(window); }

  private void ApplyFloating(JsonObject config)
  {
    if (!windows.TryGetValue("floating", out var window)) return;
    var floating = config["floatingButton"]!;
    window.Width = window.Height = Math.Max(72, Math.Round(50 * ConfigStore.Number(floating["sizePercent"], 100) / 100) + 20);
    window.Topmost = ConfigStore.Flag(floating["alwaysOnTop"], true);
    if (floating["position"]?["x"] is { } x && floating["position"]?["y"] is { } y && dragStart == null)
      NativeWindow.Move(window, (int)ConfigStore.Number(x), (int)ConfigStore.Number(y));
    Emit("floating", "floating-config-updated", floating);
  }

  public void PersistFloatingPosition()
  {
    if (!windows.TryGetValue("floating", out var window)) return;
    try
    {
      var position = NativeWindow.Position(window);
      var config = store.Load();
      config["floatingButton"]!["position"] = new JsonObject { ["x"] = position.X, ["y"] = position.Y };
      store.Save(config, false);
    }
    catch (Exception error) { Log("error", $"保存悬浮窗位置失败: {error.Message}"); }
  }

  private async Task OpenPickCount()
  {
    var config = store.Load();
    ApplyFloating(config);
    var window = await GetWindow("pick_count");
    Show(window);
    window.Emit("pick-count-open", new { config = config["pickCountDialog"] });
    Hide("floating");
  }
  private async Task OpenRecruit()
  {
    var config = store.Load();
    ApplyFloating(config);
    var window = await GetWindow("recruit");
    Show(window);
    window.Emit("recruit-window-visible", true);
    Hide("floating");
    if (ConfigStore.Flag(config["pickCountDialog"]?["defaultPlayMusic"]))
    {
      try { await audio.PlayBgm(config); } catch (Exception e) { Log("warn", e.Message); }
    }
  }
  public void CancelPickCount()
  {
    Close("pick_count");
    StopAudio("bgm");
    ShowFloating();
  }
  public void CloseRecruit()
  {
    Emit("recruit", "recruit-window-visible", false);
    Hide("recruit");
    StopAudio("bgm");
    ShowFloating();
  }
  public void ClosePickResult()
  {
    var source = drawSource;
    drawSource = null;
    results = new JsonArray();
    var reset = new { token = ++resultToken, reason = "close" };
    Emit("pick_result", "pick-result-reset", reset);
    Close("pick_result");
    Emit("pick_count", "pick-count-stop-bgm", null);
    StopAudio("bgm");
    StopAudio("gacha");
    if (source == "recruit" && windows.ContainsKey("recruit"))
    {
      Emit("recruit", "pick-result-reset", reset);
      Hide("floating");
    }
    else ShowFloating();
  }
  private async void StopAudio(string channel)
  {
    try { await audio.Stop(channel); } catch (Exception error) { Log("warn", error.Message); }
  }

  private static JsonObject RequirePool(JsonObject config, string id, string type)
  {
    if (string.IsNullOrWhiteSpace(id)) throw new InvalidOperationException("招募请求缺少卡池 ID");
    var pool = config["recruitPools"]!.AsArray().OfType<JsonObject>().FirstOrDefault(pool => ConfigStore.Text(pool["id"]) == id.Trim())
        ?? throw new InvalidOperationException($"未找到招募卡池: {id}");
    if (ConfigStore.Text(pool["gachaType"]) != type) throw new InvalidOperationException($"卡池 {id} 不支持此招募方式");
    return pool;
  }

  private async Task PresentResults(JsonObject config, JsonArray picked, string? source)
  {
    var label = source == "recruit" ? "recruit" : "pick_result";
    var window = await GetWindow(label);
    results = picked;
    drawSource = source;
    resultToken++;
    Close("pick_count");
    if (source != "recruit") Hide("recruit");
    Show(window);
    window.Emit("pick-result-reset", new { token = resultToken, reason = "before-open" });
    window.Emit("pick-result-open", new { token = resultToken, results, config = config["pickResultDialog"] });
    Hide("floating");
    Log("info", "点名结果: " + string.Join(", ", picked.Select(s => ConfigStore.Text(s?["name"]))));
  }

  public async Task<object?> InvokeAsync(BrowserWindow window, string command, JsonObject args)
  {
    string Text(string key, string fallback = "") => ConfigStore.Text(args[key], fallback);
    double Number(string key, double fallback = 0) => ConfigStore.Number(args[key], fallback);
    switch (command)
    {
      case "get_floating_button_config":
      case "get_config":
        var config = store.Load(); ApplyFloating(config);
        return command == "get_config" ? config : config["floatingButton"];
      case "get_pick_count_config": return store.Load()["pickCountDialog"];
      case "get_pick_result_config": return store.Load()["pickResultDialog"];
      case "get_pick_results": return results.DeepClone();
      case "is_window_visible": return window.IsVisible && window.Opacity > 0;
      case "floating_button_clicked":
        if (ConfigStore.Text(store.Load()["floatingButton"]?["mode"]) == "simple") await OpenPickCount(); else await OpenRecruit();
        break;
      case "floating_button_drag_mouse":
        if (window.Label != "floating") throw new InvalidOperationException("Only the floating window can be dragged.");
        dragStart = NativeWindow.Position(window);
        try { NativeWindow.DragMouse(window); }
        finally { dragStart = null; PersistFloatingPosition(); }
        break;
      case "floating_button_drag_start": dragStart = NativeWindow.Position(window); break;
      case "floating_button_drag_move":
        if (dragStart is { } start) NativeWindow.Move(window, start.X + (int)Math.Clamp(Math.Round(Number("dx")), int.MinValue, int.MaxValue), start.Y + (int)Math.Clamp(Math.Round(Number("dy")), int.MinValue, int.MaxValue));
        break;
      case "floating_button_drag_end": dragStart = null; PersistFloatingPosition(); break;
      case "cancel_pick_count": CancelPickCount(); break;
      case "confirm_pick_count":
        var drawConfig = store.Load(); ApplyFloating(drawConfig);
        var source = Text("source");
        var pool = source == "recruit" ? RequirePool(drawConfig, Text("poolId"), "gacha") : null;
        var picked = picker.Pick(drawConfig, (int)Math.Clamp(Number("count", 1), 1, 10), pool?["rateBoostStudents"] as JsonArray);
        await PresentResults(drawConfig, picked, source);
        break;
      case "confirm_select_student":
        var selectConfig = store.Load(); ApplyFloating(selectConfig);
        var selectSource = Text("source");
        if (selectSource == "recruit") RequirePool(selectConfig, Text("poolId"), "select");
        await PresentResults(selectConfig, new JsonArray(picker.Select(selectConfig, Text("studentName"))), selectSource);
        break;
      case "close_pick_result": ClosePickResult(); break;
      case "open_recruit": await OpenRecruit(); break;
      case "close_recruit": CloseRecruit(); break;
      case "open_config": Show(await GetWindow("config")); break;
      case "parse_student_list_text": return ConfigStore.ParseStudents(Text("rawText"), args["existingStudents"]);
      case "import_student_list_from_file":
        var listDialog = new OpenFileDialog { Filter = "名单文件|*.txt;*.csv|所有文件|*.*" };
        return listDialog.ShowDialog(window) == true ? ConfigStore.ParseStudents(File.ReadAllText(listDialog.FileName), args["existingStudents"]) : null;
      case "pick_asset_file":
        var assetDialog = new OpenFileDialog
        {
          Filter = Text("kind") switch
          {
            "image" => "图片文件|*.png;*.jpg;*.jpeg;*.webp;*.gif;*.svg",
            "audio" => "音频文件|*.mp3;*.wav;*.ogg;*.flac",
            "video" => "视频文件|*.mp4;*.webm;*.mov",
            _ => "资源文件|*.png;*.jpg;*.jpeg;*.webp;*.gif;*.svg;*.mp3;*.wav;*.ogg;*.mp4;*.webm"
          }
        };
        return assetDialog.ShowDialog(window) == true ? assetDialog.FileName : null;
      case "save_app_config":
        var draft = ConfigStore.Normalize(args["config"]);
        draft["floatingButton"]!["position"] = store.Load()["floatingButton"]!["position"]!.DeepClone();
        var saved = store.Save(draft); ApplyFloating(saved);
        foreach (var target in windows.Values.Where(w => w.IsReady).ToArray()) target.Emit("config-updated", saved);
        Log("info", "配置保存成功！悬浮窗已经刷新啦～");
        return SystemIntegration.Result(true, "配置保存成功！悬浮窗已经刷新啦～");
      case "get_system_fonts":
        return System.Windows.Media.Fonts.SystemFontFamilies.Select(font => font.Source).Distinct().OrderBy(name => name).ToArray();
      case "play_click_sound": await audio.Play("click", Text("path", "sound/button_click.wav"), Number("volume", 1)); break;
      case "play_bgm":
        var paths = args["paths"] as JsonArray;
        var path = paths?.Count > 0 ? ConfigStore.Text(paths[Random.Shared.Next(paths.Count)]) : "sound/bgm.mp3";
        await audio.Play("bgm", path, Number("volume", 0.3), true); break;
      case "stop_bgm": await audio.Stop("bgm"); break;
      case "play_gacha_sound": await audio.Play("gacha", Text("path", "sound/gacha_loading.ogg"), Number("volume", 0.6)); break;
      case "stop_gacha_sound": await audio.Stop("gacha"); break;
      case "get_app_info": return SystemIntegration.Info();
      case "check_update": return await UpdateChecker.Check(SystemIntegration.Version);
      case "request_admin_elevation":
        if (SystemIntegration.IsAdmin) return SystemIntegration.Result(true, "已经以管理员权限运行啦～");
        if (!SystemIntegration.Relaunch(out var error)) return SystemIntegration.Result(false, "管理员权限请求失败或被取消了...", error);
        _ = QuitAfterResponse();
        return SystemIntegration.Result(true, "已经请求管理员权限啦！马上重启～");
      case "create_admin_startup_task":
        var taskResult = await SystemIntegration.CreateStartupTask(Text("exePath"), Text("taskName"));
        if (JsonSerializer.SerializeToNode(taskResult)?["ok"]?.GetValue<bool>() == true)
        {
          var taskConfig = store.Load();
          taskConfig["webConfig"]!["adminAutoStartEnabled"] = true;
          taskConfig["webConfig"]!["adminAutoStartPath"] = Text("exePath").Trim();
          taskConfig["webConfig"]!["adminAutoStartTaskName"] = string.IsNullOrWhiteSpace(Text("taskName")) ? "KVRandom (Admin)" : Text("taskName").Trim();
          store.Save(taskConfig, false);
        }
        return taskResult;
      case "renderer_log": Log(Text("level", "info"), Text("text")); break;
      case "get_logs": return logs.Select(entry => entry.DeepClone()).ToArray();
      default: throw new InvalidOperationException($"未知桌面命令: {command}");
    }
    return null;
  }

  public void Log(string level, string text)
  {
    level = string.IsNullOrWhiteSpace(level) ? "info" : level.Trim();
    if (text.Length > 800) text = text[..800];
    var key = level + ":" + text;
    var now = DateTime.UtcNow;
    if (recentLogs.TryGetValue(key, out var previous) && now - previous < TimeSpan.FromSeconds(1)) return;
    recentLogs[key] = now;
    if (recentLogs.Count > 100)
      foreach (var old in recentLogs.Where(pair => now - pair.Value > TimeSpan.FromSeconds(10)).Select(pair => pair.Key).ToArray()) recentLogs.Remove(old);
    var entry = new JsonObject { ["id"] = Guid.NewGuid().ToString("N"), ["level"] = level, ["text"] = text, ["time"] = DateTime.Now.ToString("O") };
    logs.Add(entry);
    if (logs.Count > 2000) logs.RemoveAt(0);
    foreach (var window in windows.Values.Where(w => w.IsReady).ToArray()) window.Emit("log-entry", entry);
  }

  private void SetupTray()
  {
    var iconPath = Path.Combine(WebRoot, "image", "app.ico");
    trayIcon = File.Exists(iconPath) ? new System.Drawing.Icon(iconPath) : System.Drawing.Icon.ExtractAssociatedIcon(Environment.ProcessPath!);
    tray = new Forms.NotifyIcon { Icon = trayIcon, Text = "KVRandom - 阿罗娜在这里哦～", Visible = true };
    var menu = new Forms.ContextMenuStrip();
    menu.Items.Add("设置面板～", null, async (_, _) =>
    {
      try { Show(await GetWindow("config")); } catch (Exception error) { Log("error", error.Message); MessageBox.Show(error.Message, "KVRandom"); }
    });
    menu.Items.Add("阿罗娜先走啦～", null, (_, _) => Quit());
    tray.ContextMenuStrip = menu;
    tray.DoubleClick += (_, _) => ShowFloating();
  }
  private async Task QuitAfterResponse() { await Task.Delay(150); Quit(); }
  public void Quit()
  {
    if (IsQuitting) return;
    PersistFloatingPosition();
    IsQuitting = true;
    Dispose();
    Application.Current.Shutdown();
  }
  public void Dispose()
  {
    IsQuitting = true;
    tray?.ContextMenuStrip?.Dispose(); tray?.Dispose(); trayIcon?.Dispose();
    tray = null; trayIcon = null;
    foreach (var window in windows.Values.ToArray()) { window.CanClose = true; window.Close(); }
    windows.Clear();
  }
}
