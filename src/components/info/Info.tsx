import React, { useEffect, useState } from "react";
import styles from "./info.module.scss";
import { Chicken } from "../../models/chicken";

interface InfoProps {
  chickens: Chicken[];
  isOpen: boolean;
}

const renderChickensHunger = (chickens: Chicken[]) => {
  return chickens
    .sort((a, b) => b.getHungerMeter() - a.getHungerMeter())
    .map((chicken, i) => (
      <p key={i}>{chicken.getBreed()} chicken: {chicken.getHungerMeter()}</p>
    ))
}

export const Info: React.FC<InfoProps> = ({ chickens, isOpen }) => {
  const [, setTime] = useState(0);

  useEffect(() => {
    let id = 0;
    if(isOpen) {
      id = window.setInterval(() => setTime(Date.now()), 1000);
    }
    return () => window.clearInterval(id);
  }, [isOpen]);

  return (
    <div className={styles.info}>
      <h3 className={styles.title}>Hunger</h3>
      {renderChickensHunger(chickens)}
    </div>
  );
}