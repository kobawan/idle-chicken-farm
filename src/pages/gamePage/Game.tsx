import React from "react";
import Phaser from "phaser";
import { GameInstance, IonPhaser } from "@ion-phaser/react";
import { version } from "../../../package.json";
import GameScene from "../../scenes/GameScene";

const game: GameInstance = {
  title: "Idle Chicken Game",
  version,
  type: Phaser.AUTO,
  width: 512,
  height: 512,
  scene: [GameScene],
  backgroundColor: "#1b7a3e",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scale: {
    zoom: 1.5,
  },
};

export const Game: React.FC<{ initialize: boolean }> = ({ initialize }) => {
  return <IonPhaser game={game} initialize={initialize} />;
};
