declare module 'bun:test' {
  type TestCallback = () => void | Promise<void>

  export function describe(name: string, callback: TestCallback): void
  export function it(name: string, callback: TestCallback): void
  export function expect(actual: unknown): {
    toBe(expected: unknown): void
    toEqual(expected: unknown): void
  }
}
