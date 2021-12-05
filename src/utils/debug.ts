import Phaser from "phaser";

export const debugDraw = (scene: Phaser.Scene, layer: Phaser.Tilemaps.TilemapLayer) => {
  const debugGraphics = scene.add.graphics().setAlpha(0.75);
  layer.renderDebug(debugGraphics, {
    tileColor: null,
    collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
    faceColor: new Phaser.Display.Color(40, 39, 37, 255),
  });
};
