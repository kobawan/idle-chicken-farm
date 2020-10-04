import React from 'react';
import ReactTooltip from "react-tooltip";
import styles from './TooltipOverlay.module.scss'

export interface TooltipProps {
  id: string;
  text: string;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface TooltipOverlayProps {
  tooltips: TooltipProps[];
}

export const TooltipOverlay: React.FC<TooltipOverlayProps> = ({ tooltips }) => {
  return(
    <div className={styles.container}>
      {tooltips.map(({ id, text, minX, maxY, maxX, minY }) => (
        <>
        <div
          data-for={id}
          data-tip={text}
          data-iscapture={true}
          style={{
            position: 'relative',
            top: `${minY}px`,
            left: `${minX}px`,
            width: `${maxX - minX}px`,
            height: `${maxY - minY}px`,
          }}
        />
        <ReactTooltip
          id={id}
          place="top"
          type="dark"
          effect="solid"
          multiline={true}
        />
        </>
      ))}
    </div>
  )
}
