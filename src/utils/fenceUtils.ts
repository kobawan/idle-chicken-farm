import { RESIZE_BY, SCREEN_PADDING_PX } from "../gameConfig";
import { spriteCoordinatesMap } from "./spriteCoordinates";

const getLeftEdge = ({ horizontalGap }: { horizontalGap: number }) => {
  return SCREEN_PADDING_PX + horizontalGap;
};

const getRightEdge = ({
  fenceWidth,
  horizontalGap,
  width,
}: {
  fenceWidth: number;
  horizontalGap: number;
  width: number;
}) => {
  return width - fenceWidth * RESIZE_BY - getLeftEdge({ horizontalGap });
};

const getTopEdge = ({ verticalGap }: { verticalGap: number }) => {
  return SCREEN_PADDING_PX + verticalGap;
};

const getBottomEdge = ({
  fenceHeight,
  verticalGap,
  height,
}: {
  fenceHeight: number;
  verticalGap: number;
  height: number;
}) => {
  return height - fenceHeight * RESIZE_BY - getTopEdge({ verticalGap });
};

const calculateFenceHorizontalGap = (width: number) => {
  const { sideLeft, sideRight, top } = spriteCoordinatesMap.fence;
  const leftFenceWidth = sideLeft.width * RESIZE_BY;
  const rightFenceWidth = sideRight.width * RESIZE_BY;
  const topFenceWidth = top.width * RESIZE_BY;
  const widthAvailable = width - SCREEN_PADDING_PX * 2 - leftFenceWidth - rightFenceWidth;
  const amountHorizontalFences = Math.floor(widthAvailable / topFenceWidth);
  const horizontalGap = (widthAvailable - amountHorizontalFences * topFenceWidth) / 2;

  return {
    horizontalGap,
    amountHorizontalFences,
  };
};

const calculateFenceVerticalGap = (height: number) => {
  const { top, bottom, sideLeft } = spriteCoordinatesMap.fence;
  const topFenceHeight = top.height * RESIZE_BY;
  const bottomFenceHeight = bottom.height * RESIZE_BY;
  const sideFenceHeight = sideLeft.height * RESIZE_BY;
  const heightAvailable = height - SCREEN_PADDING_PX * 2 - topFenceHeight - bottomFenceHeight;
  const amountVerticalFences = Math.floor(heightAvailable / sideFenceHeight);
  const verticalGap = (heightAvailable - amountVerticalFences * sideFenceHeight) / 2;

  return {
    verticalGap,
    amountVerticalFences,
  };
};

export const getFenceBoundaries = (width: number, height: number) => {
  const { sideRight, sideLeft, top, bottom } = spriteCoordinatesMap.fence;
  const { verticalGap } = calculateFenceVerticalGap(height);
  const { horizontalGap } = calculateFenceHorizontalGap(width);

  return {
    left: getLeftEdge({ horizontalGap }) + sideLeft.width * RESIZE_BY,
    right: getRightEdge({ width, horizontalGap, fenceWidth: sideRight.width }),
    top: getTopEdge({ verticalGap }) + top.height * RESIZE_BY,
    bottom: getBottomEdge({ height, verticalGap, fenceHeight: bottom.height }),
  };
};

export const getWholeFenceProps = (width: number, height: number) => {
  const {
    topLeft,
    topRight,
    bottomLeft,
    bottomRight,
    top,
    bottom,
    sideLeft,
    sideRight,
  } = spriteCoordinatesMap.fence;

  // WIDTH FILLING
  const { amountHorizontalFences, horizontalGap } = calculateFenceHorizontalGap(width);

  // HEIGHT FILLING
  const { amountVerticalFences, verticalGap } = calculateFenceVerticalGap(height);

  const leftEdge = getLeftEdge({ horizontalGap });
  const topEdge = getTopEdge({ verticalGap });

  const topFence = new Array(amountHorizontalFences).fill(0).map((_, i) => ({
    top: topEdge,
    left: leftEdge + topLeft.width * RESIZE_BY + i * (top.width * RESIZE_BY),
    spriteCoordinates: top,
  }));

  const bottomFenceTopPos = getBottomEdge({ height, verticalGap, fenceHeight: bottomLeft.height });
  const bottomFence = new Array(amountHorizontalFences).fill(0).map((_, i) => ({
    top: bottomFenceTopPos,
    left: leftEdge + bottomLeft.width * RESIZE_BY + i * (bottom.width * RESIZE_BY),
    spriteCoordinates: bottom,
  }));

  const leftFence = new Array(amountVerticalFences).fill(0).map((_, i) => ({
    top: topEdge + topLeft.height * RESIZE_BY + i * (sideLeft.height * RESIZE_BY),
    left: leftEdge,
    spriteCoordinates: sideLeft,
  }));

  const rightFenceLeftPos = getRightEdge({ width, horizontalGap, fenceWidth: sideRight.width });
  const rightFence = new Array(amountVerticalFences).fill(0).map((_, i) => ({
    top: topEdge + topRight.height * RESIZE_BY + i * (sideRight.height * RESIZE_BY),
    left: rightFenceLeftPos,
    spriteCoordinates: sideRight,
  }));

  const corners = [
    {
      top: topEdge,
      left: leftEdge,
      spriteCoordinates: topLeft,
    },
    {
      top: topEdge,
      left: getRightEdge({ width, horizontalGap, fenceWidth: topRight.width }),
      spriteCoordinates: topRight,
    },
    {
      top: getBottomEdge({ height, verticalGap, fenceHeight: bottomLeft.height }),
      left: leftEdge,
      spriteCoordinates: bottomLeft,
    },
    {
      top: getBottomEdge({ height, verticalGap, fenceHeight: bottomRight.height }),
      left: getRightEdge({ width, horizontalGap, fenceWidth: bottomRight.width }),
      spriteCoordinates: bottomRight,
    },
  ];

  return [...corners, ...topFence, ...bottomFence, ...leftFence, ...rightFence];
};
