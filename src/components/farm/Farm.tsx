import React, { useEffect, memo, useReducer, useCallback, useState } from "react";
import cx from "classnames";
import styles from "./farm.module.scss";
import spriteUrl from "../../assets/farm_sprite.png";
import { useWindowDimensions } from "../../utils/useWindowDimensions";
import { getChickens } from "../../utils/drawChickens";
import { createItems } from "../../utils/drawItems";
import { getFood } from "../../utils/drawFood";
import { farmReducer, initialFarmState } from "./reducer";
import { setItemsAction, setChickensAction, setFoodAction } from "./actions";
import { StaticCanvas } from "../StaticCanvas/StaticCanvas";
import { Menu } from "../menu/Menu";
import { ChickenCanvas } from "../chickenCanvas/ChickenCanvas";
import { FoodCanvas } from "../foodCanvas/FoodCanvas";
import { RESIZE_CANVAS_BY } from "../../gameConsts";
import { OnDetectTooltipCbProps, TooltipOverlay } from "../tooltipOverlay/TooltipOverlay";
import { InteractionLayer } from "../interactionLayer/InteractionLayer";
import { version } from "../../../package.json";
import { handleChickenHover } from "./utils";
import { loadImage } from "../../utils/loadImages";

export const Farm: React.FC = memo(() => {
  const { resizedWidth, resizedHeight } = useWindowDimensions(RESIZE_CANVAS_BY);
  const [{ isDragging, isFeeding, isInfoOpen, items, chickens, food }, dispatch] = useReducer(
    farmReducer,
    initialFarmState,
  );
  const [sprite, setSprite] = useState<HTMLImageElement>();
  const onDetectTooltipCb = useCallback(
    (args: OnDetectTooltipCbProps) => handleChickenHover(chickens, args),
    [chickens],
  );

  useEffect(() => {
    // It should only run on mount
    if (!chickens.length) {
      loadImage(spriteUrl)
        .then((img) => {
          setSprite(img);
          return Promise.all([
            createItems(resizedWidth, resizedHeight, img as HTMLImageElement),
            getChickens(resizedWidth, resizedHeight, img as HTMLImageElement),
            Promise.resolve(getFood(resizedWidth, resizedHeight, img as HTMLImageElement)),
          ]);
        })
        .then(([items, chickens, food]) => {
          dispatch(setItemsAction(items));
          dispatch(setChickensAction(chickens));
          dispatch(setFoodAction(food));
        });
    }
  }, [resizedWidth, resizedHeight, chickens]);

  if (!sprite) {
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
});
