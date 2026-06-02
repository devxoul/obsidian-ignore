# Obsidian Ignore

Hide files from Obsidian using a `.obsidianignore` file — just like `.gitignore`.

Create a `.obsidianignore` file in your vault root, list the files and folders you
want hidden using standard gitignore syntax, and they disappear from the file
explorer, Quick Switcher, search, graph, and backlinks.

## How it works

The plugin reads `.obsidianignore` (gitignore syntax) and drives Obsidian's native
**Settings → Files and links → Excluded files** list (`userIgnoreFilters`). Because
this is the same mechanism Obsidian uses internally, hidden files are excluded
everywhere the native "Excluded files" setting applies:

- File explorer sidebar
- Quick Switcher (`Cmd/Ctrl+O`)
- Search
- Graph and local graph
- Backlinks and unlinked mentions

Your own manually-added Excluded-files entries are preserved — the plugin only
manages the entries it computes from `.obsidianignore`, and restores your manual
list when disabled.

## Usage

1. Install and enable the plugin.
2. Create a `.obsidianignore` file in your vault root.
3. Add patterns:

   ```gitignore
   # Hide a whole folder
   Archive/

   # Hide all files with an extension
   *.tmp

   # Hide everything under a folder, but keep one file
   build/*
   !build/keep.md

   # Nested globs
   **/drafts/
   ```

4. Save. Matching files vanish. Edit the file anytime — changes apply automatically.

## Pattern syntax

Standard gitignore semantics are supported (via the [`ignore`](https://github.com/kaelzhang/node-ignore)
library):

- `#` comments and blank lines
- `*`, `?`, `**` globs
- Trailing `/` for directory-only matches
- Leading `/` for root-anchored matches
- `!` negation to re-include — note that, like git, you cannot re-include a file
  whose parent directory is fully excluded. Use `build/*` instead of `build/` if
  you need to negate a child (`!build/keep.md`).

## Settings

- **Enable** — toggle hiding on/off. When off, the plugin removes its entries and
  restores your manual Excluded-files list.
- **Ignore file name** — change the file name (default `.obsidianignore`).

## Development

```bash
bun install
bun run dev     # watch + rebuild
bun run build   # type-check + production bundle (main.js)
bun test        # unit tests
bun run lint    # oxlint
```

## License

MIT
