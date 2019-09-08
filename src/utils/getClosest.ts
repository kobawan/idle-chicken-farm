export const getClosest = <I extends { left: number, top: number }>(
  items: I[],
  left: number,
  top: number,
) => {
  let closest = Infinity;
  let closestItem: I | undefined;

  items.forEach(item => {
    const distance = Math.sqrt(
      Math.abs(left - item.left) ** 2
      + Math.abs(top - item.top) ** 2
    );

    if (distance < closest) {
      closest = distance;
      closestItem = item;
    }
  });

  return closestItem;
};
