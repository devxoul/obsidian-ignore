import ignore, { type Ignore } from 'ignore'

export function parsePatterns(text: string): Ignore {
  const matcher = ignore()

  if (text.length === 0) {
    return matcher
  }

  return matcher.add(text.split(/\r?\n/))
}

export function computeIgnored(patternText: string, allPaths: string[]): string[] {
  const matcher = parsePatterns(patternText)
  const ignoredPaths: string[] = []
  const seenPaths = new Set<string>()

  for (const path of allPaths) {
    const normalizedPath = normalizePath(path)

    if (normalizedPath === undefined || seenPaths.has(normalizedPath) || !matcher.ignores(normalizedPath)) {
      continue
    }

    seenPaths.add(normalizedPath)
    ignoredPaths.push(normalizedPath)
  }

  return ignoredPaths
}

export function compactToFolders(ignoredPaths: string[], allPaths: string[]): string[] {
  const ignored = new Set(normalizePaths(ignoredPaths))
  const all = normalizePaths(allPaths)
  const folderDescendants = collectFolderDescendants(all)
  const fullyIgnoredFolders = [...folderDescendants.entries()]
    .filter(([, descendants]) => descendants.every((path) => ignored.has(path)))
    .map(([folder]) => folder)
    .sort(compareFoldersByDepthThenName)
  const folderEntries = shortestFolderEntries(fullyIgnoredFolders)
  const fileEntries = [...ignored].filter((path) => !folderEntries.some((folder) => path.startsWith(folder))).sort()

  // Folders first, then files; each group is sorted for deterministic Obsidian config diffs.
  return [...folderEntries.sort(), ...fileEntries]
}

function normalizePaths(paths: string[]): string[] {
  const normalizedPaths: string[] = []
  const seenPaths = new Set<string>()

  for (const path of paths) {
    const normalizedPath = normalizePath(path)

    if (normalizedPath === undefined || seenPaths.has(normalizedPath)) {
      continue
    }

    seenPaths.add(normalizedPath)
    normalizedPaths.push(normalizedPath)
  }

  return normalizedPaths
}

function normalizePath(path: string): string | undefined {
  let normalizedPath = path

  while (normalizedPath.startsWith('./') || normalizedPath.startsWith('/')) {
    normalizedPath = normalizedPath.startsWith('./') ? normalizedPath.slice(2) : normalizedPath.slice(1)
  }

  if (normalizedPath === '' || normalizedPath === '.') {
    return undefined
  }

  return normalizedPath
}

function collectFolderDescendants(paths: string[]): Map<string, string[]> {
  const descendants = new Map<string, string[]>()

  for (const path of paths) {
    const parts = path.split('/')

    for (let index = 1; index < parts.length; index += 1) {
      const folder = `${parts.slice(0, index).join('/')}/`
      const folderPaths = descendants.get(folder)

      if (folderPaths === undefined) {
        descendants.set(folder, [path])
      } else {
        folderPaths.push(path)
      }
    }
  }

  return descendants
}

function shortestFolderEntries(folders: string[]): string[] {
  const folderEntries: string[] = []

  for (const folder of folders) {
    if (folderEntries.some((entry) => folder !== entry && folder.startsWith(entry))) {
      continue
    }

    folderEntries.push(folder)
  }

  return folderEntries
}

function compareFoldersByDepthThenName(first: string, second: string): number {
  const depthDifference = folderDepth(first) - folderDepth(second)

  if (depthDifference !== 0) {
    return depthDifference
  }

  return first.localeCompare(second)
}

function folderDepth(folder: string): number {
  return folder.split('/').length
}
