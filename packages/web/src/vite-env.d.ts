/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional Clerk publishable key. When absent the UI renders without login. */
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  electron?: {
    ipcRenderer: {
      sendMessage: (channel: string, ...args: unknown[]) => void;
      on: (channel: string, func: (...args: unknown[]) => void) => () => void;
      once: (channel: string, func: (...args: unknown[]) => void) => void;
    };
  };
}
