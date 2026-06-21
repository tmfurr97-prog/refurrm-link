/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RECAPTCHA_SITE_KEY?: string;
  readonly VITE_RECAPTCHA_VERIFY_ENDPOINT?: string;
  readonly VITE_REQUIRE_RECAPTCHA_VERIFY?: string;
  readonly VITE_ENABLE_CLIENT_AI?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
