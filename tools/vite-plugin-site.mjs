// Small static-site layer for Vite's multi-page build.
//   <!-- @include partials/header.html -->      inlines a partial (recursive)
//   <!-- @render servicesExplorer -->           inlines HTML from src/content/render.mjs
//   <i data-icon="arrow-right"></i>             inlines a lucide icon (or one from src/icons)
//   <body data-page="about"> + data-nav="about" marks the current nav item with aria-current
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const RENDER_MODULE = '/src/content/render.mjs';
const iconCache = new Map();

function loadIcon(name) {
  if (iconCache.has(name)) return iconCache.get(name);
  const local = resolve(ROOT, 'src/icons', `${name}.svg`);
  const lucide = resolve(ROOT, 'node_modules/lucide-static/icons', `${name}.svg`);
  const file = existsSync(local) ? local : lucide;
  if (!existsSync(file)) throw new Error(`Unknown icon "${name}"`);
  const svg = readFileSync(file, 'utf8')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\sclass="[^"]*"/, '')
    .replace('stroke-width="2"', 'stroke-width="1.5"')
    .trim();
  iconCache.set(name, svg);
  return svg;
}

export function icon(name, cls = '') {
  return loadIcon(name).replace('<svg', `<svg class="icon${cls ? ` ${cls}` : ''}" aria-hidden="true" focusable="false"`);
}

function includePartials(html, depth = 0) {
  if (depth > 8) throw new Error('Partial includes nested too deeply');
  return html.replace(/<!--\s*@include\s+([^\s]+)\s*-->/g, (_, file) => {
    const path = resolve(ROOT, file);
    if (!existsSync(path)) throw new Error(`Missing partial ${file}`);
    return includePartials(readFileSync(path, 'utf8'), depth + 1);
  });
}

async function loadRenderers(server) {
  if (server) return server.ssrLoadModule(RENDER_MODULE);
  return import(`${pathToFileURL(resolve(ROOT, `.${RENDER_MODULE}`)).href}?t=${Date.now()}`);
}

export default function sitePlugin() {
  let server;
  return {
    name: 'gmc-site',
    configureServer(s) {
      server = s;
      const reload = (file) => {
        const f = file.replace(/\\/g, '/');
        if (/\/(partials|src\/content|src\/data|src\/icons)\//.test(f)) {
          server.moduleGraph.invalidateAll();
          server.ws.send({ type: 'full-reload' });
        }
      };
      server.watcher.on('change', reload);
      server.watcher.on('add', reload);
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(html) {
        let out = includePartials(html);
        const renderers = await loadRenderers(server);
        out = out.replace(/<!--\s*@render\s+(\w+)((?:\s+[\w-]+)*)\s*-->/g, (_, fn, args) => {
          if (typeof renderers[fn] !== 'function') throw new Error(`Unknown renderer ${fn}`);
          return renderers[fn](...args.trim().split(/\s+/).filter(Boolean));
        });
        // Icons last, so renderers can emit <i data-icon> too
        out = out.replace(/<i data-icon="([\w-]+)"(?:\s+class="([^"]*)")?\s*><\/i>/g, (_, name, cls) => icon(name, cls));
        const page = (out.match(/<body[^>]*data-page="([\w-]+)"/) || [])[1];
        if (page) out = out.replace(new RegExp(`data-nav="${page}"`, 'g'), `data-nav="${page}" aria-current="page"`);
        return out;
      },
    },
  };
}

// Build only: preload the main (latin) font file, whose hashed name is known
// only after bundling, so headline text does not wait for the CSS to discover it.
export function fontPreload() {
  return {
    name: 'gmc-font-preload',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const font = Object.keys(ctx.bundle || {}).find((k) => /schibsted-grotesk-latin-wght-normal-[\w-]+\.woff2$/.test(k));
        if (!font) return html;
        return html.replace('</title>', `</title>
    <link rel="preload" href="/${font}" as="font" type="font/woff2" crossorigin>`);
      },
    },
  };
}
