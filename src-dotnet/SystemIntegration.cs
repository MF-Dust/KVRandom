using System.ComponentModel;
using System.Diagnostics;
using System.Security.Principal;
using System.Reflection;

namespace KVRandom;

public static class SystemIntegration
{
  public static string Version => Assembly.GetExecutingAssembly().GetCustomAttribute<AssemblyInformationalVersionAttribute>()?.InformationalVersion.Split('+')[0] ?? "26.5.3";
  public static bool IsAdmin => new WindowsPrincipal(WindowsIdentity.GetCurrent()).IsInRole(WindowsBuiltInRole.Administrator);
  public static object Info() => new { version = Version, isDebugMode = DesktopHost.IsDebug, isAdmin = IsAdmin, exePath = Environment.ProcessPath ?? "" };

  public static object Result(bool ok, string message, string? detail = null) => new { ok, message, detail, restartRequired = false };
  public static bool Relaunch(out string? error)
  {
    try
    {
      var start = new ProcessStartInfo(Environment.ProcessPath!) { UseShellExecute = true, Verb = "runas", WorkingDirectory = AppContext.BaseDirectory };
      var args = Environment.GetCommandLineArgs().Skip(1).ToArray();
      for (var i = 0; i < args.Length; i++)
      {
        if (args[i] == "--wait-for-parent") { i++; continue; }
        start.ArgumentList.Add(args[i]);
      }
      start.ArgumentList.Add("--wait-for-parent");
      start.ArgumentList.Add(Environment.ProcessId.ToString());
      using var process = Process.Start(start);
      error = null;
      return process != null;
    }
    catch (Exception e) when (e is Win32Exception or InvalidOperationException)
    {
      error = e.Message;
      return false;
    }
  }

  public static async Task<object> CreateStartupTask(string exePath, string taskName)
  {
    exePath = exePath.Trim();
    taskName = string.IsNullOrWhiteSpace(taskName) ? "KVRandom (Admin)" : taskName.Trim();
    if (!Path.IsPathFullyQualified(exePath) || !File.Exists(exePath) || !exePath.EndsWith(".exe", StringComparison.OrdinalIgnoreCase))
      return Result(false, "可执行文件路径不对或者不存在哦～");
    try
    {
      var start = new ProcessStartInfo("schtasks.exe") { UseShellExecute = true, WindowStyle = ProcessWindowStyle.Hidden };
      if (!IsAdmin) start.Verb = "runas";
      foreach (var arg in new[] { "/Create", "/F", "/RL", "HIGHEST", "/SC", "ONLOGON", "/IT", "/TN", taskName, "/TR", $"\"{exePath}\"", "/RU", WindowsIdentity.GetCurrent().Name }) start.ArgumentList.Add(arg);
      using var process = Process.Start(start) ?? throw new InvalidOperationException("未能启动计划任务工具");
      await process.WaitForExitAsync();
      return Result(process.ExitCode == 0, process.ExitCode == 0 ? "开机任务已经创建/更新啦～" : "开机任务创建失败或被取消了...", $"exit code: {process.ExitCode}");
    }
    catch (Exception e) when (e is Win32Exception or InvalidOperationException) { return Result(false, "开机任务创建失败或被取消了...", e.Message); }
  }
}
