import React from "react";
import styles from "./hungerMeter.module.scss";
import { Gender } from "../../types/types";

interface HungerMeterProps {
  name: string;
  gender: Gender;
  hunger: number;
}

export const HungerMeter = ({ name, gender, hunger }: HungerMeterProps) => {
  return (
    <div>
      <h4 className={styles.name}>{name} {gender === 'male' ? '♂' : '♀' }</h4>
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
