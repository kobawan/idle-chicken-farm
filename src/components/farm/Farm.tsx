import React, { memo, useState } from "react";
import { LoadingPage } from "../../pages/loadingPage/LoadingPage";
import { Game } from "../../pages/gamePage/Game";

export const Farm: React.FC = memo(() => {
  // TODO: implement logic in new game
  // const { gameWidth, gameHeight } = useWindowDimensionsEffect();
  // const [{ isDragging, isFeeding, isInfoOpen, items, chickens, food }, dispatch] = useReducer(
  //   farmReducer,
  //   initialFarmState,
  // );
  const [isLoading, setIsLoading] = useState(false);
  const [startFadingLoadingPage, setStartFadingLoadingPage] = useState(true);

  // TODO: implement logic in new game
  // useEffect(() => {
  //   initSave(canvasWidth, canvasHeight, images);
  //   globalPositionManager.updateCanvasDimension({ canvasWidth, canvasHeight });

  //   const newChickens = getChickens(canvasWidth, canvasHeight, sprites);
  //   const newFood = getFood(canvasWidth, canvasHeight, sprites[0]);
  //   dispatch(setChickensAction(newChickens));
  //   dispatch(setFoodAction(newFood));
  // }, []);

  return (
    <>
      {(isLoading || startFadingLoadingPage) && (
        <LoadingPage
          shouldStartFading={startFadingLoadingPage}
          stopFading={() => setStartFadingLoadingPage(false)}
        />
      )}
      <Game initialize={!isLoading} />
    </>
  );
});
