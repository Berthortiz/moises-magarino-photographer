// Encuentra archivos de src/ que no son importados por ningún otro
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join, resolve, posix, dirname } from "node:path";

const SRC = "src";
const EXT_RE = /\.(astro|ts|js|css|svg|jpg|jpeg|png|webp|gif|json)$/i;

// Recolectar todos los archivos fuente (no assets de foto grandes memos: incluir todo)
const files = new Set();
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else files.add(p.replace(/\\/g, "/"));
  }
})(SRC);

// Puntos de entrada (páginas + config): no los consideramos "imports"
const entryPages = [...files].filter(
  (f) =>
    f.startsWith("src/pages/") ||
    f === "src/env.d.ts" ||
    f === "src/css/style.css",
);

// Recolectar imports de todos los archivos con auto-import de Astro (\*.astro, \*.ts)
const imported = new Set();
for (const f of files) {
  if (!/\.(astro|ts|mjs)$/.test(f)) continue;
  if (f.endsWith("env.d.ts")) continue;
  const text = readFileSync(f, "utf8");
  // líneas de import no comentadas
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) continue;
    const m = t.match(
      /(?:import|export)\s+(?:[\s\S]+?\s+from\s+)?["'](.+?)["']/,
    );
    // también imports dinámicos
    const dyn = t.match(/import\(\s*["'](.+?)["']/);
    const specs = [m?.[1], dyn?.[1]].filter(Boolean).filter((s) => /^\.\.?\//.test(s));
    for (const s of specs) {
      // resolver
      let base = s.replace(/\/index$/, "");
      for (const cand of [
        base,
        base + ".astro",
        base + ".ts",
        base + ".js",
        base + ".css",
        base + "/index.astro",
        base + "/index.ts",
      ]) {
        const withDir = posix.normalize(posix.join(dirname(f), cand));
        if (files.has(withDir)) {
          imported.add(withDir);
          break;
        }
      }
    }
    // import.meta.glob (globs)
    const glob = t.match(/import\.meta\.glob\(\s*["'](.+?)["']/);
    if (glob) {
      const g = glob[1];
      const dirG = posix.dirname(posix.join(dirname(f), g));
      for (const f2 of files) {
        if (f2.startsWith(dirG)) imported.add(f2);
      }
    }
  }
}

// Grafo: desde páginas, todo lo transitive-importado es usado
const adj = new Map();
for (const f of files) {
  if (!/\.(astro|ts)$/.test(f)) continue;
  const deps = [];
  const text = readFileSync(f, "utf8");
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) continue;
    const m = t.match(/(?:import|export)\s+(?:[\s\S]+?\s+from\s+)?["'](.+?)["']/);
    const dyn = t.match(/import\(\s*["'](.+?)["']/);
    for (const s of [m?.[1], dyn?.[1]].filter(Boolean)) {
      if (!/^\.\.?\//.test(s)) continue;
      const base = s.replace(/\/index$/, "");
      for (const cand of [
        base,
        base + ".astro",
        base + ".ts",
        base + ".js",
        base + ".css",
        base + "/index.astro",
      ]) {
        const withDir = posix.normalize(posix.join(dirname(f), cand));
        if (files.has(withDir)) deps.push(withDir);
      }
      const glob = t.match(/import\.meta\.glob\(\s*["'](.+?)["']/);
      if (glob) {
        const dirG = posix.dirname(posix.normalize(posix.join(dirname(f), glob[1])));
        for (const f2 of files) if (f2.startsWith(dirG)) deps.push(f2);
      }
    }
  }
  adj.set(f, new Set(deps));
}

const used = new Set();
function visit(f) {
  if (used.has(f)) return;
  used.add(f);
  for (const d of adj.get(f) ?? []) visit(d);
}
entryPages.forEach(visit);

console.log("=== NO USADOS (código y assets en src/) ===");
for (const f of [...files].sort()) {
  if (used.has(f)) continue;
  // saltar carpetas de assets pesados que ya revisamos aparte? incluir igual
  console.log(f);
}
