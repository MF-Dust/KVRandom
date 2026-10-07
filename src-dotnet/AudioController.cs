namespace KVRandom;

// Chromium decodes the existing WAV/MP3/OGG/FLAC assets without installing native codecs.
// The persistent floating webview owns audio even while the window is hidden.
public sealed class AudioController
{
  private readonly Func<BrowserWindow?> window;
  public AudioController(Func<BrowserWindow?> window) => this.window = window;
  public const string Script = """
        window.__kvAudio = (() => {
          const tracks = new Map();
          const clicks = new Set();
          function stop(channel) {
            const audio = tracks.get(channel);
            if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); tracks.delete(channel); }
          }
          async function play(channel, url, volume, loop) {
            if (channel !== 'click') stop(channel);
            const audio = new Audio(url);
            audio.volume = Math.max(0, Math.min(1, volume));
            audio.loop = loop;
            if (channel === 'click') {
              clicks.add(audio);
              audio.onended = audio.onerror = () => clicks.delete(audio);
            } else { tracks.set(channel, audio); }
            try { await audio.play(); }
            catch (error) { clicks.delete(audio); if (tracks.get(channel) === audio) tracks.delete(channel); throw error; }
          }
          return { play, stop };
        })();
        """;

  public Task Play(string channel, string path, double volume, bool loop = false)
  {
    var current = window() ?? throw new InvalidOperationException("音频窗口尚未创建");
    return current.RunAudioAsync($"window.__kvAudio.play({JsonSerializer.Serialize(channel)}, {JsonSerializer.Serialize(AssetHandler.Url(path))}, {JsonSerializer.Serialize(Math.Clamp(volume, 0, 1))}, {(loop ? "true" : "false")})");
  }
  public Task Stop(string channel)
  {
    var current = window();
    return current?.IsReady == true ? current.RunAudioAsync($"window.__kvAudio.stop({JsonSerializer.Serialize(channel)})") : Task.CompletedTask;
  }
  public Task PlayBgm(JsonObject config)
  {
    var pick = config["pickCountDialog"]!;
    var paths = pick["bgmPaths"]!.AsArray();
    var path = paths.Count == 0 ? "sound/bgm.mp3" : ConfigStore.Text(paths[Random.Shared.Next(paths.Count)]);
    return Play("bgm", path, ConfigStore.Number(pick["bgmVolume"], 0.3), true);
  }
}
