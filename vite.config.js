import { defineConfig } from 'vite'

export default defineConfig({
  base: '/cesium-map/',
  define: {
    CESIUM_BASE_URL: JSON.stringify('/cesium-map/cesium')
  }
})