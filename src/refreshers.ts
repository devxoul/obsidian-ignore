import { App } from 'obsidian'

import { FileExplorerViewInternal, GraphViewInternal, SearchViewInternal } from './obsidian-internals'

export function refreshViews(app: App): void {
  refreshFileExplorer(app)
  refreshSearch(app)
  refreshGraph(app)
}

function refreshFileExplorer(app: App): void {
  for (const leaf of app.workspace.getLeavesOfType('file-explorer')) {
    try {
      const view = leaf.view as unknown as FileExplorerViewInternal
      view.requestSort?.()
    } catch (_) {
      void _
    }
  }
}

function refreshSearch(app: App): void {
  for (const leaf of app.workspace.getLeavesOfType('search')) {
    try {
      const view = leaf.view as unknown as SearchViewInternal
      view.startSearch?.()
    } catch (_) {
      void _
    }
  }
}

function refreshGraph(app: App): void {
  for (const leaf of [...app.workspace.getLeavesOfType('graph'), ...app.workspace.getLeavesOfType('localgraph')]) {
    try {
      const view = leaf.view as unknown as GraphViewInternal
      view.renderer?.restart?.()
    } catch (_) {
      void _
    }
  }
}
