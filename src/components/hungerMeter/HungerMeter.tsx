import React from "react";
import styles from "./hungerMeter.module.scss";
import { Gender } from "../../types/types";

const isProduction = process.env.NODE_ENV === "production";

interface HungerMeterProps {
  name: string;
  gender: Gender;
  hunger: number;
  id: string;
}

export const HungerMeter = ({ name, gender, hunger, id }: HungerMeterProps) => {
  return (
    <div>
      <h4 className={styles.name}>
        {name} {gender === 'male' ? '♂' : '♀' }{!isProduction && <small>{id}</small>}
      </h4>
      <div className={styles.hungerRow}>
        <span className={styles.hungerLabel}>Hunger:</span>
        <div className={styles.hungerMeter}>
          <div className={styles.hungerMarker} style={{
            left: `${hunger}%`,
          }} />
        </div>
      </div>
    </div>
  );
}
