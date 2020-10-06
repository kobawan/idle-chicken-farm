import { Coordinates } from "../types/types";

interface GetClosestOptions<I> extends Coordinates {
  items: I[];
}

export const getDistance = (a: Coordinates, b: Coordinates) => {
  return Math.sqrt(Math.abs(a.left - b.left) ** 2 + Math.abs(a.top - b.top) ** 2);
};

export const getClosest = <I extends Coordinates>({ items, left, top }: GetClosestOptions<I>) => {
  let closest = Infinity;
  let closestItem: I | undefined;

  items.forEach((item) => {
    const distance = getDistance({ left, top }, item);

    if (distance < closest) {
      closest = distance;
      closestItem = item;
    }
  });

  return closestItem;
};
