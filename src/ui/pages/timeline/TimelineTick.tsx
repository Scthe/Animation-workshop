import {h, Component} from 'preact';
import {classnames, WithDimensions} from 'ui/utils';

export enum TickLabel { None, FrameId, Time }

interface TickProps {
  labelMode: TickLabel;
  className?: string;
  // position:
  frameId: number;
  time: number; // in [s]
  pixelX: number;
}

export const createTickPosition = (frameId: number, maxFrames: number, panelWidth: number) => {
  const progress = (frameId / maxFrames);
  return {
    frameId,
    time: progress,
    pixelX: progress * panelWidth,
  };
};

const getLabel = (props: TickProps) => {
  const {labelMode, frameId, time} = props;
  switch (labelMode) {
    case TickLabel.FrameId: return frameId;
    case TickLabel.Time: return time;
    default: return '';
  }
};

export const Tick = (props: TickProps) => {
  const {pixelX, frameId, className} = props;


  return (
    <div className={className} style={{left: pixelX}}>
      {getLabel(props)}
    </div>
  );
};
