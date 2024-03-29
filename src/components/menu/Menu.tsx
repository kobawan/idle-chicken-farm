import React from "react";
import cx from "classnames";
import styles from "./menu.module.scss";
import foodUrl from "../../assets/food1.png";
import chickenUrl from "../../assets/chicken.png";
import { Info } from "../info/Info";
import { Chicken } from "../../models/chicken/chicken";
import { toggleFeedingAction, toggleInfoAction } from "../farm/actions";
import { AllFarmActions } from "../farm/reducer";
import { TOGGLE_FEEDING_BTN_ID } from "./consts";

interface MenuProps {
  isInfoOpen: boolean;
  isFeeding: boolean;
  chickens: Chicken[];
  dispatch: React.Dispatch<AllFarmActions>;
}

export const Menu: React.FC<MenuProps> = ({ isInfoOpen, isFeeding, chickens, dispatch }) => {
  const toggleInfo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    dispatch(toggleInfoAction());
  };

  const toggleFeeding = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    dispatch(toggleFeedingAction());
  };

  return (
    <div className={cx(styles.menu, isInfoOpen && styles.visible)}>
      <div className={styles.toolBar}>
        <button className={cx(styles.farmButton, isInfoOpen && styles.active)} onClick={toggleInfo}>
          <img src={chickenUrl} alt="info"></img>
        </button>
        <button
          className={cx(styles.farmButton, isFeeding && styles.active)}
          onClick={toggleFeeding}
          id={TOGGLE_FEEDING_BTN_ID}
        >
          <img src={foodUrl} alt="food"></img>
        </button>
      </div>
      <Info chickens={chickens} isOpen={isInfoOpen} />
    </div>
  );
};
