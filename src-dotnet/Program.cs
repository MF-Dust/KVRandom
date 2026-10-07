using System.Diagnostics;
using System.Windows;

namespace KVRandom;

internal static class Program
{
  [STAThread]
  private static int Main(string[] args)
  {
    try
    {
      string? Option(string name)
      {
        var index = Array.IndexOf(args, name);
        return index >= 0 && index + 1 < args.Length ? args[index + 1] : null;
      }
      if (int.TryParse(Option("--wait-for-parent"), out var parentId))
      {
        try { using var parent = Process.GetProcessById(parentId); parent.WaitForExit(30000); }
        catch (ArgumentException) { /* Parent already exited. */ }
      }
      using var mutex = new Mutex(true, "Local\\com.mfdust.kvrandom.single-instance", out var created);
      if (!created) return 0;
      var store = new ConfigStore(Option("--data-dir") ?? AppContext.BaseDirectory);
      var config = store.Load();
      if (!DesktopHost.IsDebug && ConfigStore.Flag(config["webConfig"]?["adminTopmostEnabled"]) && !SystemIntegration.IsAdmin)
      {
        if (SystemIntegration.Relaunch(out var error)) return 0;
        MessageBox.Show("管理员权限请求失败或被取消，将以普通权限继续运行。\n" + error, "KVRandom");
      }
      var devUrl = Option("--dev-url");
      if (devUrl != null && (!Uri.TryCreate(devUrl, UriKind.Absolute, out var uri) || !uri.IsLoopback || uri.Scheme is not ("http" or "https")))
        throw new ArgumentException("开发地址必须是本机 HTTP(S) 地址");
      var app = new Application { ShutdownMode = ShutdownMode.OnExplicitShutdown };
      using var host = new DesktopHost(store, devUrl);
      app.DispatcherUnhandledException += (_, e) =>
      {
        host.Log("error", e.Exception.Message);
        MessageBox.Show(e.Exception.Message, "KVRandom");
        e.Handled = true;
      };
      app.Startup += async (_, _) =>
      {
        try { await host.StartAsync(); }
        catch (Exception error)
        {
          Console.Error.WriteLine(error);
          MessageBox.Show("启动失败：" + error.Message + "\n请确认已安装 Microsoft Edge WebView2 Runtime。", "KVRandom");
          app.Shutdown(1);
        }
      };
      app.SessionEnding += (_, _) => host.PersistFloatingPosition();
      return app.Run();
    }
    catch (Exception error) { Console.Error.WriteLine(error); MessageBox.Show(error.Message, "KVRandom 启动失败"); return 1; }
  }
}
