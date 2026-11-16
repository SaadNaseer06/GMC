import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import site, { fontPreload } from './tools/vite-plugin-site.mjs';

// Each page lives in its own folder so URLs stay clean: /about/, /expertise/ ...
// Full-site concept. home-backup/ stays in the project (and opens in
// development) but is left out of the build. lean/ only redirects the old
// preview address to /. The Home + Contact mockup is archived in
// _archive/concept-v1-home-contact/.
const pages = {
  index: 'index.html',
  about: 'about/index.html',
  expertise: 'expertise/index.html',
  industries: 'industries/index.html',
  'case-studies': 'case-studies/index.html',
  contact: 'contact/index.html',
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
