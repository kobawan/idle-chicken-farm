import Phaser from "phaser";
import { getWholeFenceProps } from "../utils/fenceUtils";
import { FENCE_SIZE } from "../utils/spriteCoordinates";

export default class GameScene extends Phaser.Scene {
  public preload() {
    this.load.setBaseURL(process.env.PUBLIC_URL);

    this.load.image("background", "assets/farm_bg.png");
    this.load.image("coop", "assets/coop.png");
    this.load.image("trough", "assets/trough.png");
    this.load.spritesheet("fence", "assets/fence.png", {
      frameWidth: FENCE_SIZE,
      frameHeight: FENCE_SIZE,
    });
    this.load.spritesheet("chickens", "assets/chickens.png", { frameWidth: 16, frameHeight: 16 });
  }

  public create() {
    this.addBgImage();
    this.addFence();
    this.physics.add.staticImage(
      Math.floor(this.gameSize.width * 0.2),
      Math.floor(this.gameSize.height * 0.2),
      "coop",
    );
    this.physics.add.staticImage(
      Math.floor(this.gameSize.width * 0.2) + 70,
      Math.floor(this.gameSize.height * 0.2) + 40,
      "trough",
    );
  }

  private get gameSize() {
    return { width: this.cameras.main.width, height: this.cameras.main.height };
  }

  private addBgImage() {
    const image = this.add.image(this.gameSize.width / 2, this.gameSize.height / 2, "background");
    const scaleX = this.gameSize.width / image.width;
    const scaleY = this.gameSize.height / image.height;
    const scale = Math.max(scaleX, scaleY);
    image.setScale(scale).setScrollFactor(0);
    return image;
  }

  private addFence() {
    const fence = this.physics.add.staticGroup();
    fence.createMultiple(getWholeFenceProps(this.gameSize.width, this.gameSize.height));
    return fence;
  }
}
