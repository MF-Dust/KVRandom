using System.Runtime.InteropServices;
using System.Windows.Interop;

namespace KVRandom;

internal static class NativeWindow
{
  [StructLayout(LayoutKind.Sequential)]
  private struct Rect { public int Left, Top, Right, Bottom; }
  [DllImport("user32.dll", SetLastError = true)]
  [return: MarshalAs(UnmanagedType.Bool)]
  private static extern bool GetWindowRect(IntPtr hwnd, out Rect rect);
  [DllImport("user32.dll", SetLastError = true)]
  [return: MarshalAs(UnmanagedType.Bool)]
  private static extern bool SetWindowPos(IntPtr hwnd, IntPtr insertAfter, int x, int y, int cx, int cy, uint flags);

  [DllImport("user32.dll")]
  private static extern short GetAsyncKeyState(int key);
  [DllImport("user32.dll")]
  [return: MarshalAs(UnmanagedType.Bool)]
  private static extern bool ReleaseCapture();
  [DllImport("user32.dll")]
  private static extern IntPtr SendMessage(IntPtr hwnd, uint message, IntPtr wParam, IntPtr lParam);

  public static void DragMouse(BrowserWindow window)
  {
    if ((GetAsyncKeyState(0x01) & 0x8000) == 0) return;
    ReleaseCapture();
    // Let Windows own the move loop and detect button release outside the WebView.
    SendMessage(new WindowInteropHelper(window).Handle, 0x0112, new IntPtr(0xF012), IntPtr.Zero); // WM_SYSCOMMAND, SC_MOVE | HTCAPTION
  }

  public static (int X, int Y) Position(BrowserWindow window)
  {
    if (!GetWindowRect(new WindowInteropHelper(window).Handle, out var rect)) throw new System.ComponentModel.Win32Exception();
    return (rect.Left, rect.Top);
  }
  public static void Move(BrowserWindow window, int x, int y)
  {
    if (!SetWindowPos(new WindowInteropHelper(window).Handle, IntPtr.Zero, x, y, 0, 0, 0x0015)) throw new System.ComponentModel.Win32Exception(); // NOSIZE | NOZORDER | NOACTIVATE
  }
  public static void CoverCurrentMonitor(BrowserWindow window)
  {
    var rect = System.Windows.Forms.Screen.FromPoint(System.Windows.Forms.Cursor.Position).Bounds;
    if (!SetWindowPos(new WindowInteropHelper(window).Handle, IntPtr.Zero, rect.X, rect.Y, rect.Width, rect.Height, 0x0014)) throw new System.ComponentModel.Win32Exception();
  }
}
