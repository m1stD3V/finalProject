// Vite configuration for the Time Thief game
// Sets assetsInlineLimit to 0 to prevent inlining of assets (important for Phaser)
import { defineConfig } from 'vite';

export default defineConfig({
  // Base path for GitHub Pages deployment (match repo name)
  base: '/finalProject/',
  assetsInlineLimit: 0
});
