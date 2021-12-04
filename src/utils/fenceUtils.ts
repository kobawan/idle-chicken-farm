import { SCREEN_PADDING_PX } from "../gameConfig";
import { FENCE_SIZE } from "./spriteCoordinates";

const calculateFenceHorizontalGap = (width: number) => {
  const widthAvailable = width - SCREEN_PADDING_PX * 2;
  const amountHorizontalFences = Math.floor(widthAvailable / FENCE_SIZE);

  return {
    horizontalGap: (width - FENCE_SIZE * amountHorizontalFences) / 2,
    amountHorizontalFences,
  };
};

const calculateFenceVerticalGap = (height: number) => {
  const heightAvailable = height - SCREEN_PADDING_PX * 2;
  const amountVerticalFences = Math.floor(heightAvailable / FENCE_SIZE);

  return {
    verticalGap: (height - FENCE_SIZE * amountVerticalFences) / 2,
    amountVerticalFences,
  };
};

export const getWholeFenceProps = (width: number, height: number) => {
  const { amountHorizontalFences, horizontalGap } = calculateFenceHorizontalGap(width);
  const { amountVerticalFences, verticalGap } = calculateFenceVerticalGap(height);

  const left = horizontalGap + FENCE_SIZE / 2;
  const right = width - left;
  const top = verticalGap + FENCE_SIZE / 2;
  const bottom = height - top;

  return [
    {
      key: "fence",
      frame: 0,
      setXY: { x: left, y: top },
    },
    {
      key: "fence",
      frame: 1,
      repeat: amountHorizontalFences - 3,
      setXY: { x: left + FENCE_SIZE, y: top, stepX: FENCE_SIZE },
    },
    {
      key: "fence",
      frame: 3,
      setXY: { x: right, y: top },
    },
    {
      key: "fence",
      frame: 4,
      repeat: amountVerticalFences - 3,
      setXY: { x: left, y: top + FENCE_SIZE, stepY: FENCE_SIZE },
    },
    {
      key: "fence",
      frame: 7,
      repeat: amountVerticalFences - 3,
      setXY: {
        x: right,
        y: top + FENCE_SIZE,
        stepY: FENCE_SIZE,
      },
    },
    {
      key: "fence",
      frame: 8,
      setXY: { x: left, y: bottom },
    },
    {
      key: "fence",
      frame: 9,
      repeat: amountHorizontalFences - 3,
      setXY: {
        x: left + FENCE_SIZE,
        y: bottom,
        stepX: FENCE_SIZE,
      },
    },
    {
      key: "fence",
      frame: 11,
      setXY: { x: right, y: bottom },
    },
  ];
};
