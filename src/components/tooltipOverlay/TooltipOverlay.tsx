import React, { useCallback, useState } from "react";
import ReactTooltip from "react-tooltip";
import { EventName } from "../../utils/eventUtils/events";
import { useEventEffect } from "../../utils/eventUtils/useEventEffect";
import styles from "./TooltipOverlay.module.scss";

export interface TooltipProps {
  id: string;
  text: string;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

type AddTooltip = (tProps: TooltipProps) => void;
type RemoveTooltip = (id: string) => void;
type HasTooltip = (id: string) => boolean;

export interface OnDetectTooltipCbProps {
  event: React.MouseEvent<HTMLDivElement>;
  addTooltip: AddTooltip;
  removeTooltip: RemoveTooltip;
  hasTooltip: HasTooltip;
}

interface TooltipOverlayProps {
  onDetectTooltipCb: (props: OnDetectTooltipCbProps) => void;
}

export const TooltipOverlay: React.FC<TooltipOverlayProps> = ({ onDetectTooltipCb }) => {
  const [tooltips, setTooltips] = useState<TooltipProps[]>([]);
  const addTooltip = useCallback<AddTooltip>((tProps) => setTooltips([tProps, ...tooltips]), [
    tooltips,
  ]);
  const removeTooltip = useCallback<RemoveTooltip>(
    (id) => setTooltips(tooltips.filter((p) => p.id !== id)),
    [tooltips],
  );
  const hasTooltip = useCallback<HasTooltip>((id) => tooltips.some((p) => p.id === id), [tooltips]);

  const onDetectTooltip = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onDetectTooltipCb({ event, addTooltip, removeTooltip, hasTooltip });
    },
    [onDetectTooltipCb, addTooltip, removeTooltip, hasTooltip],
  );

  useEventEffect(EventName.DetectTooltip, onDetectTooltip);

  return (
    <div className={styles.container}>
      {tooltips.map(({ id, text, minX, maxY, maxX, minY }) => (
        <React.Fragment key={id}>
          <div
            data-for={id}
            data-tip={text}
            data-iscapture={true}
            style={{
              position: "relative",
              top: `${minY}px`,
              left: `${minX}px`,
              width: `${maxX - minX}px`,
              height: `${maxY - minY}px`,
            }}
          />
          <ReactTooltip id={id} place="top" type="dark" effect="solid" multiline={true} />
        </React.Fragment>
      ))}
    </div>
  );
};
