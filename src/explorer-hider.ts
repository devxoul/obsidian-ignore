const STYLE_ID = 'obsidian-ignore-explorer-hider-style'

export function buildHidingCss(entries: string[]): string {
  const folderSelectors: string[] = []
  const fileSelectors: string[] = []

  for (const entry of entries) {
    if (entry.endsWith('/')) {
      const path = entry.slice(0, -1)

      if (path === '') {
        continue
      }

      folderSelectors.push(`.nav-folder:has(> .nav-folder-title[data-path=${cssString(path)}])`)
    } else {
      if (entry === '') {
        continue
      }

      fileSelectors.push(`.nav-file:has(> .nav-file-title[data-path=${cssString(entry)}])`)
    }
  }

  const selectors = [...folderSelectors, ...fileSelectors]

  if (selectors.length === 0) {
    return ''
  }

  return `${selectors.join(',\n')} {\n  display: none !important;\n}\n`
}

export function cssString(value: string): string {
  const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\A ').replace(/\r/g, '\\D ')

  return `"${escaped}"`
}

export function applyExplorerHiding(entries: string[], doc?: Document): void {
  // eslint-disable-next-line obsidianmd/prefer-active-doc -- this module is obsidian-agnostic; callers pass activeDocument via `doc`
  const targetDoc = doc ?? document
  let style = targetDoc.getElementById(STYLE_ID)

  if (style === null) {
    style = targetDoc.createElement('style')
    style.id = STYLE_ID
    targetDoc.head.appendChild(style)
  }

  style.textContent = buildHidingCss(entries)
}

export function removeExplorerHiding(doc?: Document): void {
  // eslint-disable-next-line obsidianmd/prefer-active-doc -- this module is obsidian-agnostic; callers pass activeDocument via `doc`
  const targetDoc = doc ?? document
  const style = targetDoc.getElementById(STYLE_ID)

  if (style !== null) {
    style.remove()
  }
}
