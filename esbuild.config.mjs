import esbuild from 'esbuild'
import process from 'node:process'
import { builtinModules } from 'node:module'

const prod = process.argv[2] === 'production'

const context = await esbuild.context({
  entryPoints: ['src/main.ts'],
  bundle: true,
  format: 'cjs',
  target: 'es2021',
  outfile: 'main.js',
  logLevel: 'info',
  treeShaking: true,
  sourcemap: prod ? false : 'inline',
  minify: prod,
  external: [
    'obsidian',
    'electron',
    '@codemirror/autocomplete',
    '@codemirror/collab',
    '@codemirror/commands',
    '@codemirror/language',
    '@codemirror/lint',
    '@codemirror/search',
    '@codemirror/state',
    '@codemirror/view',
    '@lezer/common',
    '@lezer/highlight',
    '@lezer/lr',
    ...builtinModules,
  ],
  banner: {
    js: '/* This is a generated bundle. */',
  },
})

if (prod) {
  await context.rebuild()
  process.exit(0)
}

await context.watch()
