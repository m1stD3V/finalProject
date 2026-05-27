// Polished Sprite Generator for PoC
// Creates distinct medieval and modern environment tiles
export default class SpriteGenerator {
  constructor(scene) {
    this.scene = scene;
  }

  // Generate all textures used in the PoC
  generateAll() {
    this.generateTilesets();
    this.generatePlayer();
  }

  // Generate tilesets with distinct themes for Past and Present
  generateTilesets() {
    // Past: Medieval Castle (Dark stone walls, wooden floors)
    this.generateTileset('tileset_past', [
      { color: '#4A4A4A', pattern: 'stone' }, // Wall (Index 1)
      { color: '#5D4037', pattern: 'plank' }  // Floor (Index 2)
    ]);
    
    // Present: Modern Museum (Clean white/gray walls, polished floors)
    this.generateTileset('tileset_present', [
      { color: '#E0E0E0', pattern: 'panel' }, // Wall (Index 1)
      { color: '#2C3E50', pattern: 'tile' }   // Floor (Index 2)
    ]);
  }

  // Helper to create tiles with atmospheric patterns
  generateTileset(key, tiles) {
    const size = 32;
    const canvas = this.scene.textures.createCanvas(key, size * tiles.length, size);
    const ctx = canvas.context;

    tiles.forEach((tile, i) => {
      const offsetX = i * size;
      
      // Base fill
      ctx.fillStyle = tile.color;
      ctx.fillRect(offsetX, 0, size, size);

      ctx.lineWidth = 1;

      if (tile.pattern === 'stone') {
        // Irregular medieval stonework
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.strokeRect(offsetX + 2, 2, 28, 12);
        ctx.strokeRect(offsetX + 2, 16, 12, 14);
        ctx.strokeRect(offsetX + 16, 16, 14, 14);
      } else if (tile.pattern === 'plank') {
        // Rustic wooden planks
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.moveTo(offsetX, 8); ctx.lineTo(offsetX + size, 8);
        ctx.moveTo(offsetX, 16); ctx.lineTo(offsetX + size, 16);
        ctx.moveTo(offsetX, 24); ctx.lineTo(offsetX + size, 24);
        ctx.stroke();
        // Wood grain dots
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(offsetX + 4, 4, 2, 2);
        ctx.fillRect(offsetX + 20, 12, 2, 2);
        ctx.fillRect(offsetX + 10, 20, 2, 2);
      } else if (tile.pattern === 'panel') {
        // Modern clean panels
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.strokeRect(offsetX + 1, 1, size - 2, size - 2);
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.strokeRect(offsetX, 0, size, size);
      } else if (tile.pattern === 'tile') {
        // Polished museum floor tiles
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.strokeRect(offsetX + 4, 4, 24, 24);
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.strokeRect(offsetX, 0, size, size);
      }

      // Final border for tile separation
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.strokeRect(offsetX + 0.5, 0.5, size - 1, size - 1);
    });

    canvas.refresh();
  }

  // Polished player remains the same for consistency
  generatePlayer() {
    const g = this.scene.add.graphics();
    g.generateTexture('player', 32, 32);
    g.destroy();
  }
}
