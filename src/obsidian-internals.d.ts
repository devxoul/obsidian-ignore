import 'obsidian'

declare module 'obsidian' {
  interface Vault {
    getConfig(key: string): unknown
    setConfig(key: string, value: unknown): void
    on(name: 'raw', callback: (path: string) => unknown, ctx?: unknown): import('obsidian').EventRef
  }
}

export interface FileExplorerViewInternal {
  requestSort?(): void
}

export interface SearchViewInternal {
  startSearch?(): void
}

export interface GraphViewInternal {
  renderer?: {
    restart?(): void
  }
}
