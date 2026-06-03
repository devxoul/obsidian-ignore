import 'obsidian'

declare module 'obsidian' {
  interface Vault {
    getConfig(key: string): unknown
    setConfig(key: string, value: unknown): void
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
