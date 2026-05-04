export {}

declare global {
  interface Window {
    gtag: (command: 'config' | 'event' | 'js' | 'set', targetId: string | Date, config?: Record<string, any>) => void
    dataLayer: any[]
  }

  interface ImportMetaEnv {
    readonly VITE_GA_TRACKING_ID: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}
