import React, { useEffect, memo, useReducer, useState } from "react";
import spriteUrl from "../../assets/farm_sprite.png";
import reverseSpriteUrl from "../../assets/farm_sprite_reversed.png";
import { useWindowDimensionsEffect } from "../../utils/useWindowDimensions";
import { getChickens } from "../../utils/drawChickens";
import { getItems } from "../../utils/drawItems";
import { getFood } from "../../utils/drawFood";
import { farmReducer, initialFarmState } from "./reducer";
import { setItemsAction, setChickensAction, setFoodAction } from "./actions";
import { loadMultipleImages } from "../../utils/loadImages";
import { initSave } from "../../utils/saveUtils/migrateSaves";
import { LoadingPage } from "../../pages/loadingPage/LoadingPage";
import { GamePage } from "../../pages/gamePage/GamePage";
import { globalPositionManager } from "../../models/globalPositionManager";

export const Farm: React.FC = memo(() => {
  const { canvasWidth, canvasHeight } = useWindowDimensionsEffect();
  const [{ isDragging, isFeeding, isInfoOpen, items, chickens, food }, dispatch] = useReducer(
    farmReducer,
    initialFarmState,
  );
  const [sprites, setSprites] = useState<HTMLImageElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startFadingLoadingPage, setStartFadingLoadingPage] = useState(false);

  useEffect(() => {
    loadMultipleImages([spriteUrl, reverseSpriteUrl])
      .then((images) => {
        initSave(canvasWidth, canvasHeight, images);
        setSprites(images);
      })
      .catch(() => {
        // TODO: improve error handling
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sprites.length) {
      return;
    }
    globalPositionManager.updateCanvasDimension({ canvasWidth, canvasHeight });

    const newItems = getItems(canvasWidth, canvasHeight, sprites[0]);
    const newChickens = getChickens(canvasWidth, canvasHeight, sprites);
    const newFood = getFood(canvasWidth, canvasHeight, sprites[0]);
    dispatch(setItemsAction(newItems));
    dispatch(setChickensAction(newChickens));
    dispatch(setFoodAction(newFood));

    setStartFadingLoadingPage(true);
    setIsLoading(false);
  }, [canvasWidth, canvasHeight, sprites]);

  /*
   * Very important to not render canvases before init is done,
   * otherwise the saves are overritten with empty arrays
   */
  return (
    <>
      {(isLoading || startFadingLoadingPage) && (
        <LoadingPage
          shouldStartFading={startFadingLoadingPage}
          stopFading={() => setStartFadingLoadingPage(false)}
        />
      )}
      {!isLoading && (
        <GamePage
          {...{
            isDragging,
            isFeeding,
            isInfoOpen,
            items,
            chickens,
            food,
            canvasHeight,
            canvasWidth,
            sprite: sprites[0],
            dispatch,
          }}
        />
      )}
    </>
  );
});
