## [Unreleased]

### Added

- Added a full recruit window flow with configurable recruit pools, ticket/currency interactions, and select-student recruitment.
- Select-student recruitment intentionally treats selection tickets as an entry condition rather than a consumed resource.
- Added recruit pool settings and batch student metadata editing in the configuration UI.
- Affected files: `src/views/Recruit.vue`, `src/api/recruitApi.js`, `src-tauri/src/commands.rs`, `src-tauri/src/config.rs`, `src-tauri/src/windows.rs`, and related config UI modules.
