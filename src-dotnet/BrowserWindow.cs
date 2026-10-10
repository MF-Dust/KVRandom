using System.Diagnostics;
using System.Windows;
using System.Windows.Media;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.Wpf;

namespace KVRandom;

public sealed class BrowserWindow : Window, IDisposable
{
  private readonly DesktopHost host;
  private readonly WebView2CompositionControl view = new();
  private readonly TaskCompletionSource ready = new(TaskCreationOptions.RunContinuationsAsynchronously);
  private readonly Dictionary<int, TaskCompletionSource> scriptRequests = new();
  private int scriptId;
  private bool disposed;
  public string Label { get; }
  public bool CanClose { get; set; }
  public bool IsReady => ready.Task.IsCompletedSuccessfully;

  public BrowserWindow(DesktopHost host, string label, string route)
  {
    this.host = host;
    Label = label;
    Title = label switch { "config" => "KVRandom 设置面板～", "recruit" => "ブルーアーカイブ", _ => "KVRandom - 阿罗娜在这里～" };
    var overlay = label is "floating" or "pick_count" or "pick_result";
    WindowStyle = overlay ? WindowStyle.None : WindowStyle.SingleBorderWindow;
    AllowsTransparency = overlay;
    Background = overlay ? Brushes.Transparent : Brushes.White;
    ShowInTaskbar = label != "floating" && (!overlay || DesktopHost.IsDebug);
    ResizeMode = overlay ? ResizeMode.NoResize : ResizeMode.CanResize;
    Topmost = overlay;
    Width = label switch { "config" => 1120, "recruit" => 1280, _ => 72 };
    Height = label switch { "config" => 760, "recruit" => 720, _ => 72 };
    if (label == "recruit") { MinWidth = 960; MinHeight = 540; }
    if (label is "pick_count" or "pick_result")
    {
      var screen = System.Windows.Forms.Screen.FromPoint(System.Windows.Forms.Cursor.Position);
      var dpi = VisualTreeHelper.GetDpi(this);
      Left = screen.Bounds.Left / dpi.DpiScaleX;
      Top = screen.Bounds.Top / dpi.DpiScaleY;
      Width = screen.Bounds.Width / dpi.DpiScaleX;
      Height = screen.Bounds.Height / dpi.DpiScaleY;
    }
    view.DefaultBackgroundColor = overlay ? System.Drawing.Color.Transparent : System.Drawing.Color.White;
    Content = view;
    Opacity = 0;
    Closing += (_, e) =>
    {
      if (CanClose || host.IsQuitting) return;
      if (label == "recruit") { e.Cancel = true; host.CloseRecruit(); }
      else if (label == "pick_count") { e.Cancel = true; host.CancelPickCount(); }
      else if (label == "pick_result") { e.Cancel = true; host.ClosePickResult(); }
      else if (label == "floating") { e.Cancel = true; host.PersistFloatingPosition(); }
    };
    Closed += (_, _) => { Dispose(); host.WindowClosed(label); };
    Route = route;
  }

  private string Route { get; }

  public async Task InitializeAsync()
  {
    Show(); // Composition needs an HWND; keep invisible until the renderer is mounted.
    await view.EnsureCoreWebView2Async(await host.EnvironmentTask);
    var core = view.CoreWebView2;
    core.Settings.AreDefaultContextMenusEnabled = DesktopHost.IsDebug;
    core.Settings.AreDevToolsEnabled = DesktopHost.IsDebug;
    core.Settings.AreHostObjectsAllowed = false;
    core.PermissionRequested += (_, e) => e.State = CoreWebView2PermissionState.Deny;
    core.SetVirtualHostNameToFolderMapping("kvrandom.local", host.WebRoot, CoreWebView2HostResourceAccessKind.DenyCors);
    core.AddWebResourceRequestedFilter("https://assets.kvrandom.local/*", CoreWebView2WebResourceContext.All);
    core.WebResourceRequested += (_, e) => host.Assets.Handle(core, e);
    core.NavigationStarting += (_, e) =>
    {
      if (host.IsAppUrl(e.Uri)) return;
      e.Cancel = true;
      OpenExternal(e.Uri);
    };
    core.NewWindowRequested += (_, e) => { e.Handled = true; OpenExternal(e.Uri); };
    core.WebMessageReceived += OnMessage;
    core.ProcessFailed += (_, e) =>
    {
      var error = new InvalidOperationException($"WebView2 进程异常: {e.ProcessFailedKind}");
      ready.TrySetException(error);
      foreach (var request in scriptRequests.Values) request.TrySetException(error);
      scriptRequests.Clear();
      host.Log("error", error.Message);
    };
    await core.AddScriptToExecuteOnDocumentCreatedAsync("window.__KV_DESKTOP__ = true;\n" + AudioController.Script);
    core.Navigate(host.AppUrl + "/index.html" + (Route == "" ? "" : "#" + Route));
    await ready.Task.WaitAsync(TimeSpan.FromSeconds(45));
    Hide();
    Opacity = 1;
  }

  private async void OnMessage(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
  {
    if (!host.IsAppUrl(e.Source) || disposed) return;
    int? requestId = null;
    try
    {
      var message = JsonNode.Parse(e.WebMessageAsJson)!.AsObject();
      switch (ConfigStore.Text(message["type"]))
      {
        case "ready": ready.TrySetResult(); return;
        case "script-result":
          var id = (int)ConfigStore.Number(message["id"]);
          if (scriptRequests.Remove(id, out var pending))
          {
            if (ConfigStore.Flag(message["ok"])) pending.TrySetResult();
            else pending.TrySetException(new InvalidOperationException(ConfigStore.Text(message["error"])));
          }
          return;
        case "invoke":
          requestId = (int)ConfigStore.Number(message["id"]);
          var result = await host.InvokeAsync(this, ConfigStore.Text(message["cmd"]), message["args"] as JsonObject ?? new JsonObject());
          Post(new { type = "response", id = requestId, ok = true, result });
          return;
      }
    }
    catch (Exception error)
    {
      if (requestId != null) Post(new { type = "response", id = requestId, ok = false, error = error.Message });
      host.Log("error", error.Message);
    }
  }

  public void Emit(string name, object? payload) => Post(new { type = "event", @event = name, payload });
  private void Post(object message)
  {
    if (!disposed && view.CoreWebView2 != null) view.CoreWebView2.PostWebMessageAsJson(JsonSerializer.Serialize(message));
  }

  public async Task RunAudioAsync(string expression)
  {
    if (!IsReady || disposed) throw new InvalidOperationException("音频窗口尚未就绪");
    var id = ++scriptId;
    var completion = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
    scriptRequests.Add(id, completion);
    try
    {
      await view.CoreWebView2.ExecuteScriptAsync($"(async () => {{ try {{ await ({expression}); chrome.webview.postMessage({{type:'script-result',id:{id},ok:true}}); }} catch(e) {{ chrome.webview.postMessage({{type:'script-result',id:{id},ok:false,error:String(e)}}); }} }})()");
      await completion.Task.WaitAsync(TimeSpan.FromSeconds(15));
    }
    finally { scriptRequests.Remove(id); }
  }

  private static void OpenExternal(string value)
  {
    if (Uri.TryCreate(value, UriKind.Absolute, out var uri) && uri.Scheme is "https" or "http")
      Process.Start(new ProcessStartInfo(value) { UseShellExecute = true });
  }

  public void Dispose()
  {
    if (disposed) return;
    disposed = true;
    ready.TrySetException(new ObjectDisposedException(Label));
    foreach (var request in scriptRequests.Values) request.TrySetException(new ObjectDisposedException(Label));
    scriptRequests.Clear();
    view.Dispose();
  }
}
