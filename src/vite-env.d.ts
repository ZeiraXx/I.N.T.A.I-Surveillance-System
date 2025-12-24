/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATA_MODE?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_DASHBOARD_PATH?: string;
  readonly VITE_MOCK_LIVE_MP4_URL?: string;
  readonly VITE_MOCK_MANIP_MP4_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}


