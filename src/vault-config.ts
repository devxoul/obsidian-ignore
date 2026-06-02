export function recoverManual(current: string[], lastWrittenPluginEntries: string[]): string[] {
  const pluginEntries = new Set(lastWrittenPluginEntries)

  return current.filter((entry) => !pluginEntries.has(entry))
}

export function mergeEntries(manual: string[], computed: string[]): string[] {
  const merged: string[] = []
  const seen = new Set<string>()

  for (const entry of manual) {
    if (seen.has(entry)) {
      continue
    }

    seen.add(entry)
    merged.push(entry)
  }

  for (const entry of computed) {
    if (seen.has(entry)) {
      continue
    }

    seen.add(entry)
    merged.push(entry)
  }

  return merged
}

export function diffChanged(prevComputed: string[], nextComputed: string[]): boolean {
  const prevEntries = new Set(prevComputed)
  const nextEntries = new Set(nextComputed)

  if (prevEntries.size !== nextEntries.size) {
    return true
  }

  for (const entry of prevEntries) {
    if (!nextEntries.has(entry)) {
      return true
    }
  }

  return false
}

export function stripOnUnload(current: string[], lastWrittenPluginEntries: string[]): string[] {
  return recoverManual(current, lastWrittenPluginEntries)
}
