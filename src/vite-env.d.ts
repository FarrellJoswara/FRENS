/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string; // optional if you use it elsewhere
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
