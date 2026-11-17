import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'jsdom',
    environmentOptions: { jsdom: { url: 'http://127.0.0.1:5174' } },
    include: ['tests/integration/**/*.test.js'],
    setupFiles: ['./src/test/setup.js'],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
}))
