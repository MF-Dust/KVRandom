/**
 * Desktop command input/output types. Names match src-dotnet/DesktopHost.cs.
 */

// ---------- App / system ----------

export interface AppInfo {
  version: string
  isDebugMode: boolean
  isAdmin: boolean
  exePath: string
}

export interface UpdateResult {
  ok: boolean
  status: 'idle' | 'loading' | 'ok' | 'update' | 'easter' | 'error' | string
  title: string
  detail: string
  commitUrl?: string
  releaseUrl?: string
  localVersion: string
  remoteVersion?: string
  debug: string[]
}
