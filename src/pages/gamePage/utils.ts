import { Chicken } from "../../models/chicken/chicken";
import { OnDetectTooltipCbProps } from "../../components/tooltipOverlay/TooltipOverlay";

export const handleChickenHover = (
  chickens: Chicken[],
  { event, addTooltip, removeTooltip, hasTooltip }: OnDetectTooltipCbProps,
) => {
  const { clientX, clientY } = event;
  chickens.forEach((chicken) => {
    const { id, name, gender } = chicken;
    const { minX, minY, maxX, maxY } = chicken.boundaries;
    const withinBoundaries =
      clientX >= minX && clientX <= maxX && clientY >= minY && clientY <= maxY;
    const isHovered = hasTooltip(id);

    if (withinBoundaries && !isHovered) {
      addTooltip({
        id,
        text: `${gender === "male" ? "♂" : "♀"} ${name}`,
        minX,
        minY,
        maxX,
        maxY,
      });
      return;
    }
    if (!withinBoundaries && isHovered) {
      removeTooltip(id);
    }
  });
};
