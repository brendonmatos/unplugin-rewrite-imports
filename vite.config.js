/// <reference types="vitest" />

import { defineConfig } from 'vite'
import { resolve } from 'node:path'
// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      name: 'i5o8',
      fileName: 'plugin',
    },
    rollupOptions: {
      external: ['vite', 'vitest', 'unplugin'],
    },
  },
  test: {
    globals: true,
  }
})
