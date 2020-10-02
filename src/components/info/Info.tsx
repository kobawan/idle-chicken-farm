import React, { useEffect, useState } from "react";
import styles from "./info.module.scss";
import { Chicken } from "../../models/chicken/Chicken";
import { HungerMeter } from "../hungerMeter/HungerMeter";

interface InfoProps {
  chickens: Chicken[];
  isOpen: boolean;
}

const renderChickensHunger = (chickens: Chicken[]) => {
  return chickens
    .map((chicken, i) => (
      <HungerMeter
        key={i}
        name={chicken.name}
        gender={chicken.gender}
        hunger={chicken.getHungerMeter()}
      />
    ));
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
      <hr className={styles.hr}/>
      {renderChickensHunger(chickens)}
    </div>
  );
}
