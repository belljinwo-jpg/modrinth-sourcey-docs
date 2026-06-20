import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { minify } from "html-minifier-terser";

async function htmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await htmlFiles(path)));
    else if (entry.name.endsWith(".html")) files.push(path);
  }
  return files;
}

for (const page of await htmlFiles("dist")) {
  const source = await readFile(page, "utf8");
  const output = await minify(source, {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
    keepClosingSlash: true,
    minifyCSS: true,
    minifyJS: true,
    removeComments: true,
    removeRedundantAttributes: true,
    sortAttributes: true,
    sortClassName: true,
  });
  await writeFile(page, output);
}

await writeFile(
  "dist/index.html",
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/gists.html"><title>GitHub REST API — Gists Reference</title></head><body><a href="/gists.html">Open the GitHub Gists API reference</a></body></html>',
);
