import React, { useEffect, memo, useReducer, useCallback, useState } from "react";
import cx from "classnames";
import styles from "./farm.module.scss";
import spriteUrl from "../../assets/farm_sprite.png";
import { useWindowDimensions } from "../../utils/useWindowDimensions";
import { getChickens } from "../../utils/drawChickens";
import { getItems } from "../../utils/drawItems";
import { getFood } from "../../utils/drawFood";
import { farmReducer, initialFarmState } from "./reducer";
import { setItemsAction, setChickensAction, setFoodAction } from "./actions";
import { StaticCanvas } from "../StaticCanvas/StaticCanvas";
import { Menu } from "../menu/Menu";
import { ChickenCanvas } from "../chickenCanvas/ChickenCanvas";
import { FoodCanvas } from "../foodCanvas/FoodCanvas";
import { OnDetectTooltipCbProps, TooltipOverlay } from "../tooltipOverlay/TooltipOverlay";
import { InteractionLayer } from "../interactionLayer/InteractionLayer";
import { version } from "../../../package.json";
import { handleChickenHover } from "./utils";
import { loadImage } from "../../utils/loadImages";

export const Farm: React.FC = memo(() => {
  const { resizedWidth, resizedHeight } = useWindowDimensions();
  const [{ isDragging, isFeeding, isInfoOpen, items, chickens, food }, dispatch] = useReducer(
    farmReducer,
    initialFarmState,
  );
  const [sprite, setSprite] = useState<HTMLImageElement>();
  const [isLoading, setIsLoading] = useState(true);
  const onDetectTooltipCb = useCallback(
    (args: OnDetectTooltipCbProps) => handleChickenHover(chickens, args),
    [chickens],
  );

  useEffect(() => {
    loadImage(spriteUrl).then((img) => {
      setSprite(img);
    });
  }, []);

  useEffect(() => {
    if (!sprite) {
      return;
    }
    const newItems = getItems(resizedWidth, resizedHeight, sprite);
    const newChickens = getChickens(resizedWidth, resizedHeight, sprite);
    const newFood = getFood(resizedWidth, resizedHeight, sprite);
    dispatch(setItemsAction(newItems));
    dispatch(setChickensAction(newChickens));
    dispatch(setFoodAction(newFood));
    setIsLoading(false);
  }, [resizedWidth, resizedHeight, sprite]);

  /*
   * Very important to not render canvases before init is done,
   * otherwise the saves are overritten with empty arrays
   */
  if (isLoading) {
    // TODO: display loading screen
    return null;
  }

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
          sprite={sprite as HTMLImageElement}
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
});
