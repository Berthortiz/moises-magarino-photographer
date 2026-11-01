// Limpieza post-build: borra de dist/_astro los JPG/PNG originales que
// ninguna página, CSS, JS o SVG del sitio compilado referencia.
// Los esenciales (webp, avif, js, css, fuentes, svg referenciados) no se tocan.
import { unlinkSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const ASTRO = join(DIST, "_astro");

// Extensiones que se analizan para borrar (apenas originales raster)
const DELETABLE = new Set([".jpg", ".jpeg", ".png"]);
// Archivos de texto donde buscar referencias
const TEXT_EXTS = new Set([
    ".html", ".css", ".js", ".mjs", ".json", ".svg", ".xml", ".txt",
]);

let haystack = "";

// 1. Aplana todo el texto del dist en un solo string para poder buscar
function collectText(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
            collectText(full);
        } else if (TEXT_EXTS.has(extOf(entry.name))) {
            haystack += readFileSync(full, "utf8");
        }
    }
}

function extOf(name) {
    const i = name.lastIndexOf(".");
    return i === -1 ? "" : name.slice(i).toLowerCase();
}

// 2. Recorre dist/_astro y borra los no referenciados
function collectAstro(dir, out = []) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) collectAstro(full, out);
        else out.push(full);
    }
    return out;
}

try {
    collectText(DIST);
} catch {
    console.error("✗ No hay dist/. Ejecuta 'astro build' antes.");
    process.exit(1);
}

let deletedCount = 0;
let freedBytes = 0;
let keptCount = 0;

for (const file of collectAstro(ASTRO)) {
    const base = file.split(/[\\/]/).pop();
    const ext = extOf(base ?? "");
    if (!DELETABLE.has(ext)) continue;

    // Comprueba el nombre tal cual y con espacios URL-encodados
    const name = base;
    const encoded = name.replace(/ /g, "%20");
    const referenced = haystack.includes(name) || haystack.includes(encoded);

    if (referenced) {
        keptCount++;
        continue;
    }

    freedBytes += statSync(file).size;
    unlinkSync(file);
    deletedCount++;
}

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;
console.log(`✓ Limpieza dist: ${deletedCount} originales borrados (${mb(freedBytes)}) · ${keptCount} originales en uso conservados.`);
