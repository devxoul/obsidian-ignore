import { describe, it, expect } from "bun:test";

import { compactToFolders, computeIgnored } from "./ignore-engine";

describe("computeIgnored", () => {
  it("matches a basic glob", () => {
    expect(computeIgnored("*.log", ["app.log", "app.txt"])).toEqual(["app.log"]);
  });

  it("matches globstar patterns at root and nested paths", () => {
    expect(computeIgnored("**/foo.md", ["a/b/foo.md", "foo.md", "foo.txt"])).toEqual([
      "a/b/foo.md",
      "foo.md",
    ]);
  });

	it("re-includes negated paths", () => {
		expect(computeIgnored("build/*\n!build/keep.md", ["build/x.md", "build/keep.md"])).toEqual([
			"build/x.md",
		]);
	});

  it("matches directory-only patterns", () => {
    expect(computeIgnored("logs/", ["logs/a.txt", "logs.md", "other/logs/a.txt"])).toEqual([
      "logs/a.txt",
      "other/logs/a.txt",
    ]);
  });

  it("ignores comments and blank lines", () => {
    expect(computeIgnored("# comment\n\n*.tmp", ["x.tmp", "comment", "x.txt"])).toEqual(["x.tmp"]);
  });

  it("normalizes leading slash and dot prefixes", () => {
    expect(computeIgnored("*.log\nnested/*.tmp", ["/app.log", "./nested/file.tmp", ".", "/", "./"])).toEqual([
      "app.log",
      "nested/file.tmp",
    ]);
  });
});

describe("compactToFolders", () => {
  it("compacts a fully ignored folder into one folder entry", () => {
    const allPaths = ["node_modules/a.js", "node_modules/pkg/index.js"];
    const ignoredPaths = computeIgnored("node_modules/", allPaths);

    expect(compactToFolders(ignoredPaths, allPaths)).toEqual(["node_modules/"]);
  });

  it("keeps individual files for a partially ignored folder", () => {
    expect(compactToFolders(["src/generated.md"], ["src/generated.md", "src/main.ts"])).toEqual([
      "src/generated.md",
    ]);
  });

	it("does not compact a folder when negation re-includes a child", () => {
		const allPaths = ["build/x.md", "build/keep.md", "build/drop.md"];
		const ignoredPaths = computeIgnored("build/*\n!build/keep.md", allPaths);

    expect(ignoredPaths).toEqual(["build/x.md", "build/drop.md"]);
    expect(compactToFolders(ignoredPaths, allPaths)).toEqual(["build/drop.md", "build/x.md"]);
  });

  it("lets a fully ignored parent folder subsume child folders", () => {
    const allPaths = ["a/file.md", "a/b/one.md", "a/b/c/two.md"];
    const ignoredPaths = computeIgnored("a/", allPaths);

    expect(compactToFolders(ignoredPaths, allPaths)).toEqual(["a/"]);
  });
});
