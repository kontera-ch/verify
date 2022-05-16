import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import stdLibBrowser from 'node-stdlib-browser';
import inject from '@rollup/plugin-inject';

export default defineConfig({
  publicDir: 'public',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      ...stdLibBrowser
    }
  },
  optimizeDeps: {
    include: ['buffer', 'process']
    /*
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: [
        NodeModulesPolyfills(),
        GlobalsPolyfills({
          process: true,
          buffer: true
        })
      ]
    }
    */
  },
  plugins: [
    vue(),
    {
      ...inject({
        global: [require.resolve('node-stdlib-browser/helpers/esbuild/shim'), 'global'],
        process: [require.resolve('node-stdlib-browser/helpers/esbuild/shim'), 'process'],
        Buffer: [require.resolve('node-stdlib-browser/helpers/esbuild/shim'), 'Buffer']
      }),
      enforce: 'post'
    }
  ],
  build: {
    target: 'es2015',
    outDir: 'dist',
    sourcemap: true
  },
  server: {
    port: 8080,
    strictPort: true
  }
});
