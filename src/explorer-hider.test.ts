import { describe, it, expect } from 'bun:test'

import { buildHidingCss, cssString } from './explorer-hider'

describe('cssString', () => {
  it('wraps a plain value in double quotes', () => {
    expect(cssString('apps')).toBe('"apps"')
  })

  it('escapes an embedded double quote', () => {
    // expected represents: " a \ " b "
    expect(cssString('a"b')).toBe('"a\\"b"')
  })

  it('escapes a backslash', () => {
    // input: a \ b  ->  " a \ \ b "
    expect(cssString('a\\b')).toBe('"a\\\\b"')
  })
})

describe('buildHidingCss', () => {
  it('builds a folder selector and the display-none rule block', () => {
    const css = buildHidingCss(['apps/'])

    expect(css.includes('.nav-folder:has(> .nav-folder-title[data-path="apps"])')).toBe(true)
    expect(css.endsWith('{\n  display: none !important;\n}\n')).toBe(true)
  })

  it('builds a file selector', () => {
    const css = buildHidingCss(['docs/note.md'])

    expect(css.includes('.nav-file:has(> .nav-file-title[data-path="docs/note.md"])')).toBe(true)
  })

  it('emits folder selectors before file selectors in a single rule block', () => {
    const css = buildHidingCss(['apps/', 'docs/note.md'])
    const folderSelector = '.nav-folder:has(> .nav-folder-title[data-path="apps"])'
    const fileSelector = '.nav-file:has(> .nav-file-title[data-path="docs/note.md"])'

    expect(css).toBe(`${folderSelector},\n${fileSelector} {\n  display: none !important;\n}\n`)
  })

  it('returns an empty string for no entries', () => {
    expect(buildHidingCss([])).toBe('')
  })

  it('skips a slash-only entry', () => {
    expect(buildHidingCss(['/'])).toBe('')
  })

  it('skips empty entries while keeping valid ones', () => {
    const css = buildHidingCss(['a/', ''])

    expect(css).toBe('.nav-folder:has(> .nav-folder-title[data-path="a"]) {\n  display: none !important;\n}\n')
  })

  it('preserves spaces inside a quoted folder path', () => {
    const css = buildHidingCss(['My Folder/'])

    expect(css.includes('.nav-folder:has(> .nav-folder-title[data-path="My Folder"])')).toBe(true)
  })
})
