import React, { useCallback, version } from "react";
import cx from "classnames";
import styles from "./gamePage.module.scss";
import { ChickenCanvas } from "../chickenCanvas/ChickenCanvas";
import { FoodCanvas } from "../foodCanvas/FoodCanvas";
import { InteractionLayer } from "../interactionLayer/InteractionLayer";
import { Menu } from "../menu/Menu";
import { StaticCanvas } from "../StaticCanvas/StaticCanvas";
import { OnDetectTooltipCbProps, TooltipOverlay } from "../tooltipOverlay/TooltipOverlay";
import { AllFarmActions, FarmState } from "../farm/reducer";
import { handleChickenHover } from "../farm/utils";

interface GamePageProps extends FarmState {
  resizedWidth: number;
  resizedHeight: number;
  sprite: HTMLImageElement;
  dispatch: React.Dispatch<AllFarmActions>;
}

export const GamePage: React.FC<GamePageProps> = ({
  isDragging,
  isFeeding,
  food,
  chickens,
  isInfoOpen,
  resizedWidth,
  resizedHeight,
  items,
  sprite,
  dispatch,
}) => {
  const onDetectTooltipCb = useCallback(
    (args: OnDetectTooltipCbProps) => handleChickenHover(chickens, args),
    [chickens],
  );

  return (
    <div className={cx(styles.wrapper, isFeeding && styles.feeding)}>
      <InteractionLayer>
        <div className={styles.bg} />
        <StaticCanvas resizedWidth={resizedWidth} resizedHeight={resizedHeight} items={items} />
        <FoodCanvas
          resizedWidth={resizedWidth}
          resizedHeight={resizedHeight}
          food={food}
          isDragging={isDragging}
          isFeeding={isFeeding}
          sprite={sprite}
          dispatch={dispatch}
        />
        <ChickenCanvas
          resizedWidth={resizedWidth}
          resizedHeight={resizedHeight}
          chickens={chickens}
        />
        <TooltipOverlay onDetectTooltipCb={onDetectTooltipCb} />
        <a
          href="https://github.com/kobawan/idle-chicken-farm/blob/master/CHANGELOG.md"
          target="_blank"
          rel="noreferrer noopener"
          className={styles.version}
        >
          {version}
        </a>
        <Menu
          isInfoOpen={isInfoOpen}
          isFeeding={isFeeding}
          chickens={chickens}
          dispatch={dispatch}
        />
      </InteractionLayer>
    </div>
  );
};
