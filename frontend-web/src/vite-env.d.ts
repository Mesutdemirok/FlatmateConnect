/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // ileride başka VITE_ değişkenleri eklersek buraya yazarız
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}