import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import site, { fontPreload } from './tools/vite-plugin-site.mjs';

// Each page lives in its own folder so URLs stay clean: /about/, /expertise/ ...
// Client mockup: only Home and Contact are built. about/, expertise/,
// industries/ and home-backup/ stay in the project (and open in development)
// but are left out of the build until they are needed again. Add them back
// here to publish them. lean/ only redirects the old preview address to /.
const pages = {
  index: 'index.html',
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
