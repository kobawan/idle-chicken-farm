import React, { useRef } from "react";
import { Zone } from "../../models/globalPositionManager";
import { ColoredZone } from "./ColoredZone";

interface ZoneDebuggerProps {
  freeZones: Zone[];
  noGoZones: Zone[];
  hidden: boolean;
}

export const ZoneDebugger: React.FC<ZoneDebuggerProps> = ({ freeZones, noGoZones, hidden }) => {
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let y = 0; y < 6; y++) {
      color += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return color + "70";
  };

  const freeZoneColors = useRef(freeZones.map(getRandomColor)).current;

  if (hidden) {
    return null;
  }

  return (
    <>
      {freeZones.map((zone, i) => {
        const id = `free-zone-${i}`;
        return <ColoredZone id={id} key={id} zone={zone} color={freeZoneColors[i]} />;
      })}
      {noGoZones.map((zone, i) => {
        const id = `no-go-zone-${i}`;
        return <ColoredZone id={id} key={id} zone={zone} color={"#ff00009c"} />;
      })}
    </>
  );
};
