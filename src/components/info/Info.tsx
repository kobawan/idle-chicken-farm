import React, { useEffect, useState } from "react";
import styles from "./info.module.scss";
import { Chicken } from "../../utils/chicken";

interface InfoProps {
  chickens: Chicken[];
}

export const Info: React.FC<InfoProps> = ({ chickens }) => {
  const [, setTime] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTime(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className={styles.info}>
      {chickens
        .map(chicken => ({
          breed: chicken.getBreed(),
          hunger: chicken.getHungerMeter(),
        }))
        .sort((a, b) => a.hunger - b.hunger)
        .map(({ breed, hunger }, i) => (
          <p key={i}>{breed} chicken: {hunger}</p>
        ))
      }
    </div>
  );
}