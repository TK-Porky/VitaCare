// ─── Update System Types ───────────────────────────────────────────────────

export interface AppVersion {
  version: string;          // semver e.g. "1.2.3"
  buildNumber: number;      // monotonically increasing integer
  releaseDate: string;      // ISO 8601
  releaseNotes: string;
  downloadUrl?: string;     // for native binary updates (APK / IPA)
  isMandatory: boolean;     // force update — cannot be dismissed
  minSupportedBuild?: number; // below this build, the update is mandatory
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  isMandatory: boolean;
  latestVersion?: AppVersion;
  currentVersion: string;
  currentBuild: number;
}

export type UpdateChannel = 'production' | 'staging' | 'development';
