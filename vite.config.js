import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import site, { fontPreload } from './tools/vite-plugin-site.mjs';

// Each page lives in its own folder so URLs stay clean: /about/, /expertise/ ...
// Version 3: the live site's pages and layout (Home, About us, Expertise,
// Industries), redesigned. The contact form is on the home page (/#contact),
// as on the live site. Earlier concepts are archived in _archive/. contact/,
// case-studies/, home-backup/ and lean/ stay in the project (development
// only) but are left out of the build.
const pages = {
  index: 'index.html',
  about: 'about/index.html',
  expertise: 'expertise/index.html',
  industries: 'industries/index.html',
};
const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  publicDir: 'static',
  plugins: [site(), fontPreload()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(Object.entries(pages).map(([name, file]) => [name, `${root}${file}`])),
    },
  },
  optimizeDeps: { entries: Object.values(pages) },
  server: {
    // IPv4 loopback, so both http://localhost:5173 and http://127.0.0.1:5173 work
    host: '127.0.0.1',
    port: 5173,
    watch: {
      ignored: ['**/_archive/**', '**/.taste-skill/**', '**/assets/**', '**/v1/**', '**/shots/**', '**/public/**', '**/source-images/**'],
    },
  },
});
