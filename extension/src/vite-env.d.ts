/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STORE_LINK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
