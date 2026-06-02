import { describe, it, expect } from "bun:test";

import {
  diffChanged,
  mergeEntries,
  recoverManual,
  stripOnUnload,
} from './vault-config'

describe('vault config ownership logic', () => {
  describe('recoverManual', () => {
    it('removes last written plugin entries while preserving user order', () => {
      expect(recoverManual(['userA', 'node_modules/', 'userB'], ['node_modules/'])).toEqual([
        'userA',
        'userB',
      ])
    })

    it('returns current entries unchanged when nothing was last written', () => {
      expect(recoverManual(['userA', 'node_modules/', 'userB'], [])).toEqual([
        'userA',
        'node_modules/',
        'userB',
      ])
    })
  })

  describe('mergeEntries', () => {
    it('keeps manual entries first and skips duplicate computed entries', () => {
      expect(mergeEntries(['userA'], ['node_modules/', 'userA'])).toEqual([
        'userA',
        'node_modules/',
      ])
    })

    it('returns computed entries when manual entries are empty', () => {
      expect(mergeEntries([], ['a/', 'b/'])).toEqual(['a/', 'b/'])
    })

    it('keeps a shared manual and computed entry once as plugin-owned while enabled', () => {
      expect(mergeEntries(['shared/'], ['shared/'])).toEqual(['shared/'])
    })
  })

  describe('diffChanged', () => {
    it('returns false for the same sets in different orders', () => {
      expect(diffChanged(['a', 'b'], ['b', 'a'])).toBe(false)
    })

    it('returns true when the next set adds an entry', () => {
      expect(diffChanged(['a'], ['a', 'b'])).toBe(true)
    })

    it('returns false for two empty sets', () => {
      expect(diffChanged([], [])).toBe(false)
    })
  })

  describe('stripOnUnload', () => {
    it('recovers original manual entries after merge when stripping the same plugin entries', () => {
      const manual = ['userX']
      const computed = ['c/']
      const merged = mergeEntries(manual, computed)

      expect(stripOnUnload(merged, computed)).toEqual(['userX'])
    })
  })
})
