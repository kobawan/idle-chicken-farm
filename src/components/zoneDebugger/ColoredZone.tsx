import React from "react";
import { Zone } from "../../models/globalPositionManager";

interface ColoredZoneProps {
  zone: Zone;
  id: string;
  color: string;
}

export const ColoredZone: React.FC<ColoredZoneProps> = ({ color, zone, id }) => {
  return (
    <div
      id={id}
      style={{
        position: "absolute",
        backgroundColor: color,
        top: zone.top,
        height: zone.bottom - zone.top,
        left: zone.left,
        width: zone.right - zone.left,
      }}
    />
  );
};
