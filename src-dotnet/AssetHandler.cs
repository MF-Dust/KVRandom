using Microsoft.Web.WebView2.Core;

namespace KVRandom;

public sealed class AssetHandler
{
  public static string Url(string path)
  {
    path = path.Trim();
    if (Uri.TryCreate(path, UriKind.Absolute, out var uri) && uri.Scheme is "http" or "https" or "data" or "blob") return path;
    if (Path.IsPathFullyQualified(path)) return "https://assets.kvrandom.local/file?path=" + Uri.EscapeDataString(path);
    return "https://kvrandom.local/" + path.Replace('\\', '/').TrimStart('/').Replace("public/", "", StringComparison.Ordinal);
  }

  public void Handle(CoreWebView2 core, CoreWebView2WebResourceRequestedEventArgs e)
  {
    if (!Uri.TryCreate(e.Request.Uri, UriKind.Absolute, out var uri) || uri.Host != "assets.kvrandom.local") return;
    try
    {
      var query = uri.Query.TrimStart('?');
      if (uri.AbsolutePath != "/file" || !query.StartsWith("path=", StringComparison.Ordinal))
        throw new InvalidDataException("资源路径不正确");
      var path = Uri.UnescapeDataString(query[5..]);
      if (!Path.IsPathFullyQualified(path) || e.Request.Method is not ("GET" or "HEAD"))
        throw new InvalidDataException("资源请求不正确");
      var length = new FileInfo(path).Length;
      long start = 0, end = length - 1;
      var partial = false;
      if (e.Request.Headers.Contains("Range"))
      {
        var range = e.Request.Headers.GetHeader("Range");
        if (!TryRange(range, length, out start, out end))
        {
          e.Response = core.Environment.CreateWebResourceResponse(null, 416, "Range Not Satisfiable", $"Content-Range: bytes */{length}\r\nAccess-Control-Allow-Origin: *");
          return;
        }
        partial = true;
      }
      var headers = $"Content-Type: {Mime(path)}\r\nContent-Length: {Math.Max(0, end - start + 1)}\r\nAccept-Ranges: bytes\r\nAccess-Control-Allow-Origin: *";
      if (partial) headers += $"\r\nContent-Range: bytes {start}-{end}/{length}";
      e.Response = core.Environment.CreateWebResourceResponse(e.Request.Method == "HEAD" ? null : new FileSliceStream(path, start, Math.Max(0, end - start + 1)),
          partial ? 206 : 200, partial ? "Partial Content" : "OK", headers);
    }
    catch (Exception error) when (error is IOException or UnauthorizedAccessException or ArgumentException)
    {
      e.Response = core.Environment.CreateWebResourceResponse(null, 404, "Not Found", "Access-Control-Allow-Origin: *");
    }
  }

  public static bool TryRange(string range, long length, out long start, out long end)
  {
    start = 0; end = length - 1;
    if (length <= 0 || !range.StartsWith("bytes=", StringComparison.Ordinal)) return false;
    var parts = range[6..].Split('-');
    if (parts.Length != 2) return false;
    if (parts[0] == "")
    {
      if (!long.TryParse(parts[1], out var suffix) || suffix <= 0) return false;
      start = Math.Max(0, length - suffix);
    }
    else
    {
      if (!long.TryParse(parts[0], out start) || start < 0 || start >= length) return false;
      if (parts[1] != "" && (!long.TryParse(parts[1], out end) || end < start)) return false;
      end = Math.Min(end, length - 1);
    }
    return true;
  }

  private static string Mime(string path) => Path.GetExtension(path).ToLowerInvariant() switch
  {
    ".png" => "image/png",
    ".jpg" or ".jpeg" => "image/jpeg",
    ".svg" => "image/svg+xml",
    ".webp" => "image/webp",
    ".gif" => "image/gif",
    ".bmp" => "image/bmp",
    ".ico" => "image/x-icon",
    ".mp4" or ".m4v" => "video/mp4",
    ".webm" => "video/webm",
    ".mov" => "video/quicktime",
    ".mp3" => "audio/mpeg",
    ".wav" => "audio/wav",
    ".ogg" => "audio/ogg",
    ".flac" => "audio/flac",
    ".m4a" => "audio/mp4",
    _ => "application/octet-stream"
  };

  // WebView2 owns the response stream; the underlying FileStream also releases its handle on collection.
  private sealed class FileSliceStream : Stream
  {
    private readonly FileStream file;
    private readonly long offset;
    private readonly long length;
    public FileSliceStream(string path, long offset, long length)
    {
      file = File.Open(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete);
      this.offset = offset; this.length = length; file.Position = offset;
    }
    public override bool CanRead => true;
    public override bool CanSeek => true;
    public override bool CanWrite => false;
    public override long Length => length;
    public override long Position { get => file.Position - offset; set => Seek(value, SeekOrigin.Begin); }
    public override int Read(byte[] buffer, int offset, int count) => file.Read(buffer, offset, (int)Math.Min(count, Math.Max(0, length - Position)));
    public override long Seek(long value, SeekOrigin origin)
    {
      var next = origin switch { SeekOrigin.Begin => value, SeekOrigin.Current => Position + value, SeekOrigin.End => length + value, _ => throw new ArgumentOutOfRangeException(nameof(origin)) };
      if (next < 0 || next > length) throw new IOException("资源流位置超出范围");
      file.Position = offset + next;
      return next;
    }
    public override void Flush() { }
    public override void SetLength(long value) => throw new NotSupportedException();
    public override void Write(byte[] buffer, int offset, int count) => throw new NotSupportedException();
    protected override void Dispose(bool disposing) { if (disposing) file.Dispose(); base.Dispose(disposing); }
  }
}
