import React, { useRef } from "react";
import { globalPositionManager } from "../../models/globalPositionManager";

const DEBUG_FREE_ZONES = false;

export const ZoneDebugger: React.FC = () => {
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let y = 0; y < 6; y++) {
      color += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return color + "50";
  };

  const zones = useRef(
    globalPositionManager.freeZones.map((zone) => ({ ...zone, color: getRandomColor() })),
  ).current;

  return (
    <>
      {DEBUG_FREE_ZONES &&
        zones.map((zone, i) => {
          return (
            <div
              key={`zone-${i}`}
              style={{
                position: "absolute",
                backgroundColor: zone.color,
                top: zone.top,
                height: zone.bottom - zone.top,
                left: zone.left,
                width: zone.right - zone.left,
              }}
            />
          );
        })}
    </>
  );
};
