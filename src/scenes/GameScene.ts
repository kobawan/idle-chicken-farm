import Phaser from "phaser";
import { ChickenFrameIndex, createChickenAnimations } from "../anims/ChickenAnims";
import { ChickenBreed } from "../types/types";

const TILES = "tiles";
const TILEMAP = "farm";
const SPRITE_FILE_NAME = "farm_sprite";

enum Layer {
  Background = "Background",
  Ground = "Ground",
  Fence = "Fence",
  Coop = "Coop",
  Trough = "Trough",
}

export default class GameScene extends Phaser.Scene {
  public preload() {
    this.load.setBaseURL(process.env.PUBLIC_URL);

    this.load.image(TILES, "assets/tiles/farm_sprite.png");
    this.load.tilemapTiledJSON(TILEMAP, "assets/tiles/farm.json");

    this.load.atlas("chicken", "assets/chickens/chickens.png", "assets/chickens/chickens.json");
  }

  public create() {
    const map = this.make.tilemap({ key: TILEMAP });
    const tileset = map.addTilesetImage(SPRITE_FILE_NAME, TILES);
    map.createLayer(Layer.Background, tileset);
    map.createLayer(Layer.Ground, tileset);
    const fenceLayer = map.createLayer(Layer.Fence, tileset);
    const coopLayer = map.createLayer(Layer.Coop, tileset);
    const troughLayer = map.createLayer(Layer.Trough, tileset);

    fenceLayer.setCollisionByProperty({ collides: true });
    coopLayer.setCollisionByProperty({ collides: true });
    troughLayer.setCollisionByProperty({ collides: true });

    // debugDraw(this, fenceLayer);
    // debugDraw(this, coopLayer);
    // debugDraw(this, troughLayer);

    createChickenAnimations(this);

    const orangeChicken = this.physics.add.sprite(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "chicken",
      `${ChickenBreed.orange}-right-${ChickenFrameIndex.Standing}.png`,
    );
    orangeChicken.anims.play(`${ChickenBreed.orange}-walking-right`);

    this.physics.add.collider(orangeChicken, fenceLayer);
    this.physics.add.collider(orangeChicken, coopLayer);
    this.physics.add.collider(orangeChicken, troughLayer);
  }
}
