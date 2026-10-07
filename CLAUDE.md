# CLAUDE.md

## Project overview

KVRandom is a Windows desktop app with a .NET 10 C# WPF/WebView2 host and a Vue 3/Vite renderer. Separate native windows host the floating button, pick count, pick result, recruit and configuration routes. Runtime `config.yml` and `list.yaml` live beside the executable; `--data-dir` overrides this for isolated testing.

## Commands

- `npm ci` — install locked frontend dependencies.
- `npm run dev` — start Vite and the C# desktop host together.
- `npm run dev:frontend` — browser-only Vite preview on port 5173.
- `npm run build:frontend` — build renderer into `dist/`.
- `npm run build:backend` — compile `src-dotnet/KVRandom.csproj`.
- `npm run build` — publish self-contained Windows x64 app into `release/win-x64/`.
- `npm run type-check`, `npm run lint`, `npm test` — renderer checks.
- `npm run test:backend` — runnable C# checks, no additional test framework.
- `dotnet format src-dotnet/KVRandom.csproj` — format C#.

## Architecture

- `src-dotnet/Program.cs`: STA entrypoint, single-instance mutex, startup elevation and WPF application lifetime.
- `src-dotnet/DesktopHost.cs`: command dispatch, window transitions, draw state, tray and log buffer.
- `src-dotnet/BrowserWindow.cs`: transparent composition webview, trusted-origin IPC, renderer-ready handshake and external-link handling.
- `src-dotnet/ConfigStore.cs`: existing camelCase YAML schema, shared defaults, normalization, signatures and student-list parsing. Invalid YAML must not be overwritten.
- `src/configDefaults.json`: defaults shared by the renderer and embedded C# backend.
- `src-dotnet/Picker.cs`: weighted selection, rate boosts and ten-draw pity.
- `src-dotnet/AudioController.cs`: persistent floating webview audio, including existing OGG assets.
- `src-dotnet/AssetHandler.cs`: local absolute/UNC assets and media byte ranges; bundled assets map to `wwwroot`.
- `src-dotnet/SystemIntegration.cs`, `UpdateChecker.cs`: Windows elevation/startup tasks and GitHub release checks.
- `src/api/desktopCore.ts`: command/response correlation and event subscriptions over `chrome.webview`. Put feature calls in `src/api/` rather than invoking the bridge from components.
- `src/types/`: camelCase API/config/event contracts.
- `index.html`: renderer CSP. Native windows reject navigation away from the app origin.

## Tests and conventions

Frontend tests live beside modules and use Vitest/happy-dom. Backend checks live in `src-dotnet/tests/`. Run frontend build/type-check/tests and backend build/tests for changes; run the full publish command for release changes. Desktop transitions, transparency, audio and UAC need Windows UI smoke testing.

Use 2-space indentation in Vue/TypeScript/CSS/JSON/YAML and standard 4-space C# indentation. Preserve third-party asset licensing notes in README. Do not edit generated `dist`, `node_modules`, `bin`, `obj`, or `release` files directly. Commit prefixes include `功能:`, `修复:`, `优化:`, `项目:`, `版本号:`, and `Agent:`.
