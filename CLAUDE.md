# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Blue Random / 蔚蓝点名 is a Windows-oriented Tauri 2 desktop app using a Rust backend and a Vue 3 + Vite renderer. The app shows a floating button, opens fullscreen draw/count/result windows, and provides an in-app configuration page. Runtime configuration is read from and written to `config.yml` in the program working directory.

## Common commands

- `npm ci` — install exact frontend/Tauri CLI dependencies from `package-lock.json`.
- `npm run dev` — start the full Tauri development app; Tauri runs `npm run dev:frontend` first.
- `npm run dev:frontend` — start only the Vite renderer on `http://localhost:5173`.
- `npm run build:frontend` — build only the renderer into `dist/`.
- `npm run preview` — preview the built Vite frontend.
- `npm run build` — build the full Tauri app and Windows installers; artifacts are under `src-tauri/target/release/bundle/`.
- `npm run type-check` — run `vue-tsc --noEmit` over the renderer.
- `npm run lint` / `npm run lint:fix` — run ESLint 9 flat config (`eslint.config.mjs`); warnings allowed.
- `npm run format` / `npm run format:check` — run Prettier.
- `npm test` / `npm run test:watch` — run the Vitest suite (`src/**/*.{test,spec}.ts`).
- `npm run test:rust` — alias for `cargo test --manifest-path=src-tauri/Cargo.toml`.
- `cargo fmt --manifest-path src-tauri/Cargo.toml` — format Rust code.
- `cargo check --manifest-path src-tauri/Cargo.toml` — type-check the Rust backend without packaging.
- `cargo test --manifest-path src-tauri/Cargo.toml` — run Rust tests.
- `cargo test --manifest-path src-tauri/Cargo.toml parse_student_list_text_dedupes_and_preserves_weights` — run a Rust unit test by name.

Commit subjects must match `commitlint.config.mjs`: `功能: ...`, `修复: ...`, `优化: ...`, `项目: ...`, `版本号: ...`, or `Agent: ...`. Husky runs lint-staged on `pre-commit` and commitlint on `commit-msg`.

## Architecture notes

- `src-tauri/src/main.rs` is a thin binary entrypoint that calls `kvrandom_lib::run()`.
- `src-tauri/src/lib.rs` is only the Tauri entrypoint: setup callback, window event handling, and the `invoke_handler!` registration. Business logic lives in dedicated modules:
  - `src-tauri/src/commands/` — `#[tauri::command]` handlers grouped by surface (`floating`, `pick_dialog`, `audio`, `pick_result`, `config_cmd`, `system`, `log`); commands are referenced via full module paths in `lib.rs`.
  - `src-tauri/src/config/` — `mod.rs` owns public types; `store.rs` handles disk I/O and signatures; `normalize.rs` clamps/defaults; `student_parse.rs` parses list text.
  - `src-tauri/src/error.rs` — `AppError` (`thiserror`) plus `AppResult<T>`; all commands return `AppResult<T>` and serialize errors as `{ kind, message }` over IPC.
  - `src-tauri/src/logging.rs` — `BufferLayer` `tracing` subscriber that mirrors events into the in-memory 600-entry `LogEntry` ring buffer on `AppState` and emits the `log-entry` event to webviews.
  - `picker.rs`, `audio.rs`, `windows.rs`, `tray.rs`, `update.rs`, `admin.rs`, `state.rs`, `models.rs`, `utils.rs` — single-purpose support modules.
- Tauri creates separate webview windows labeled `floating`, `pick_count`, `pick_result`, `recruit`, and `config`. Routes are hash-based and map to Vue views in `src/router/index.ts`.
- `src/main.ts` forwards renderer warnings/errors to the backend log buffer and redirects plain browser preview sessions to `/config`.
- `src/api/` is the per-feature bridge between Vue code and Tauri commands/events (`tauriCore.ts` wraps `invoke` with `unwrapAppError`). Prefer adding new renderer/backend calls there rather than invoking Tauri directly from components.
- `src/types/` mirrors the Rust-side serde camelCase shapes (`config.ts`, `domain.ts`, `events.ts`, `api.ts`); import via `@/types`.
- `src/views/` contains route-level Vue screens: `Floating.vue`, `PickCount.vue`, `PickResult.vue`, `Recruit.vue`, and `WebConfig.vue`. Shared UI pieces live in `src/components/`; cross-view state machines live in `src/composables/`.
- `src-tauri/tauri.conf.json` wires Tauri dev/build commands to Vite, sets `frontendDist` to `../dist`, disables a CSP (`csp: null`), declares no initial windows, and bundles `public/` resources plus Windows NSIS/MSI targets.
- Static assets are bundled from `public/`, especially `public/image/` and `public/sound/`; README notes these assets have separate third-party licensing considerations.

## Testing

- Frontend: Vitest with `happy-dom` (`vitest.config.mts`); tests live next to source as `src/**/*.{test,spec}.ts`.
- Rust: in-module `#[cfg(test)] mod tests { … }`. Run the whole suite with `cargo test --manifest-path src-tauri/Cargo.toml`.

## Style and conventions

- Follow the existing style: 2-space indentation in Vue, TypeScript, CSS, JSON, and YAML; use `rustfmt` for Rust.
- Vue components use PascalCase filenames; route views belong in `src/views/`.
- TypeScript exports use camelCase; `@` aliases to `src` via `vite.config.ts`.
- Rust serialized config/API fields use camelCase via Serde while Rust identifiers remain snake_case/PascalCase.
- Git history commonly uses concise Chinese prefixes such as `功能:`, `修复:`, `优化:`, `项目:`, `版本号:`, and `Agent:`; enforced by `commitlint.config.mjs`.
