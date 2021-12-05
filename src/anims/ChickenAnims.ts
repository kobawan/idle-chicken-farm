import { ChickenBreed } from "../types/types";

export enum ChickenFrameIndex {
  None,
  Standing,
  Walking,
  RestingWingDown,
  RestingWingUp,
}

export const createChickenAnimations = (scene: Phaser.Scene) => {
  Object.values(ChickenBreed).forEach((breed) => {
    scene.anims.create({
      key: `${breed}-walking-left`,
      frames: [
        { key: "chicken", frame: `${breed}-left-${ChickenFrameIndex.Standing}.png` },
        { key: "chicken", frame: `${breed}-left-${ChickenFrameIndex.Walking}.png` },
      ],
      repeat: -1,
      frameRate: 2,
    });
    scene.anims.create({
      key: `${breed}-walking-right`,
      frames: [
        { key: "chicken", frame: `${breed}-right-${ChickenFrameIndex.Standing}.png` },
        { key: "chicken", frame: `${breed}-right-${ChickenFrameIndex.Walking}.png` },
      ],
      repeat: -1,
      frameRate: 2,
    });
    scene.anims.create({
      key: `${breed}-resting-left`,
      frames: [{ key: "chicken", frame: `${breed}-left-${ChickenFrameIndex.RestingWingDown}.png` }],
      frameRate: 1,
    });
    scene.anims.create({
      key: `${breed}-resting-right`,
      frames: [
        { key: "chicken", frame: `${breed}-right-${ChickenFrameIndex.RestingWingDown}.png` },
      ],
      frameRate: 1,
    });
  });
};
