import React from "react";
import Phaser from "phaser";
import { GameInstance, IonPhaser } from "@ion-phaser/react";
import GameScene from "../../scenes/GameScene";

const game: GameInstance = {
  type: Phaser.AUTO,
  width: "100%",
  height: "100%",
  scene: [GameScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
    },
  },
};

export const Game: React.FC<{ initialize: boolean }> = ({ initialize }) => {
  return <IonPhaser game={game} initialize={initialize} />;
};
