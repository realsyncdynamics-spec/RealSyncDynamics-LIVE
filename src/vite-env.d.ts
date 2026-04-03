/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly VITE_STRIPE_PRICE_BRONZE: string;
  readonly VITE_STRIPE_PRICE_SILVER: string;
  readonly VITE_STRIPE_PRICE_GOLD: string;
  readonly VITE_STRIPE_PRICE_PLATINUM: string;
  readonly VITE_STRIPE_PRICE_DIAMOND: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
