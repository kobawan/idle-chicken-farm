import React, { useEffect, memo, useReducer, useState } from "react";
import spriteUrl from "../../assets/farm_sprite.png";
import { useWindowDimensions } from "../../utils/useWindowDimensions";
import { getChickens } from "../../utils/drawChickens";
import { getItems } from "../../utils/drawItems";
import { getFood } from "../../utils/drawFood";
import { farmReducer, initialFarmState } from "./reducer";
import { setItemsAction, setChickensAction, setFoodAction } from "./actions";
import { loadImage } from "../../utils/loadImages";
import { initSave } from "../../utils/saveUtils/migrateSaves";
import { LoadingPage } from "../../pages/loadingPage/LoadingPage";
import { GamePage } from "../../pages/gamePage/GamePage";

export const Farm: React.FC = memo(() => {
  const { resizedWidth, resizedHeight } = useWindowDimensions();
  const [{ isDragging, isFeeding, isInfoOpen, items, chickens, food }, dispatch] = useReducer(
    farmReducer,
    initialFarmState,
  );
  const [sprite, setSprite] = useState<HTMLImageElement>();
  const [isLoading, setIsLoading] = useState(true);
  const [startFadingLoadingPage, setStartFadingLoadingPage] = useState(false);

  useEffect(() => {
    loadImage(spriteUrl)
      .then((img) => {
        initSave(resizedWidth, resizedHeight, img);
        setSprite(img);
      })
      .catch(() => {
        // TODO: improve error handling
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    setStartFadingLoadingPage(true);
    setIsLoading(false);
  }, [resizedWidth, resizedHeight, sprite]);

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
            resizedHeight,
            resizedWidth,
            sprite: sprite as HTMLImageElement,
            dispatch,
          }}
        />
      )}
    </>
  );
});
