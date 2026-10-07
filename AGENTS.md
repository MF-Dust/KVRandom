# Repository Guidelines

## Project Structure

KVRandom is a .NET 10 C# WPF/WebView2 Windows desktop app with a Vue 3/Vite renderer.

- `src/`: renderer, views, components, types and desktop API wrappers.
- `src-dotnet/`: C# desktop host, commands, configuration, picker and Windows integration.
- `src-dotnet/tests/`: runnable backend checks.
- `src/configDefaults.json`: defaults shared with the C# backend.
- `public/image/`, `public/sound/`: bundled third-party assets.
- `config.yml`, `list.yaml`: runtime examples; preserve existing user data and YAML schema.
- `dist/`, `node_modules/`, `src-dotnet/**/bin/`, `src-dotnet/**/obj/`, `release/`: generated outputs, do not edit directly.

## Commands

- `npm ci`: install exact Node dependencies.
- `npm run dev`: start Vite and the C# desktop app.
- `npm run dev:frontend`: browser-only Vite development on port 5173.
- `npm run build:frontend`: build renderer.
- `npm run build:backend`: compile C# desktop host.
- `npm run build`: self-contained Windows x64 publish into `release/win-x64/`.
- `npm run type-check`, `npm run lint`, `npm test`: renderer checks.
- `npm run test:backend`: backend checks.
- `dotnet format src-dotnet/KVRandom.csproj`: format C#.

## Style and Tests

Use 2-space indentation for Vue/TypeScript/CSS/JSON/YAML and 4-space C# indentation. Vue components use PascalCase names; route views live in `src/views/`. TypeScript exports use camelCase and the `@` alias. C# classes/methods/properties use PascalCase. JSON/YAML fields remain camelCase.

Before a PR, run frontend build, type-check and tests plus backend build and tests. For packaging changes run `npm run build`. Place renderer tests near modules and backend checks in `src-dotnet/tests/`. Smoke-test window transitions, floating dragging/position persistence, audio, tray and UAC on Windows when affected.

## Commits and Security

Use concise Chinese prefixes such as `功能:`, `修复:`, `优化:`, `项目:`, `版本号:`, and `Agent:`. Keep commits focused. Use `[unstable]` for preview releases and `[ci]` to trigger the Windows release workflow.

PRs should include a summary, linked issues, validation commands and screenshots/recordings for UI changes. Do not commit personal configuration, secrets, installers or local build artifacts. Preserve README licensing notes for `public/` assets. Only trusted app-origin pages may invoke native commands; do not relax navigation/IPC boundaries to load external content.
