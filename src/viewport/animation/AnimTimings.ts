import {uiBridge, appStateGetter} from 'state';
import {GlState} from 'viewport/GlState';
import {
  animationSecondsToFrame,
  updateAnimationFrameIdText
} from './index';

/** Animation timing etc. */
export interface AnimTimings {
  // previous -> this frame
  deltaTimeMs: number;

  // id of frame to render (in range of previewRange). Used for interpolation etc.
  animationFrameId: number;

  // time elapsed since app start
  absoluteTimeMs: number;

  // id of current frame counting from app start
  aboluteFrameId: number;

  // lerp/slerp interpolation for rotation
  useSlerp: boolean;
}

const miliSecToSec = (ms: number) => ms / 1000;

const calculateCurrentAnimFrame = (
  currentFrameOnUI: number, absoluteTime: number, previewRange: number[],
  glState: GlState
) => {
  const {animationState} = glState;

  let frame = currentFrameOnUI;

  if (animationState.isPlaying) {
    const deltaTimeMs = absoluteTime - animationState.animationStartTimestamp;
    const deltaFrames = animationSecondsToFrame(miliSecToSec(deltaTimeMs));

    const frameSpan = previewRange[1] - previewRange[0];
    frame = (deltaFrames % frameSpan) + previewRange[0];
  }

  return frame;
};

// 'do expressions' not supported in TS ATM
export const createAnimTimings = (() => {
  let timeOld = 0;
  let aboluteFrameId = 0;

  return (timeMs: number, glState: GlState): AnimTimings => {
    const deltaTimeMs = timeMs - timeOld;
    timeOld = timeMs;

    ++aboluteFrameId;

    const {currentFrame, useSlerp, previewRangeSorted, showTimeAsSeconds} = uiBridge.getFromUI(
      appStateGetter('currentFrame', 'useSlerp', 'previewRangeSorted', 'showTimeAsSeconds')
    );

    const animationFrameId = calculateCurrentAnimFrame(
      currentFrame, timeMs, previewRangeSorted, glState
    );

    const {animationState} = glState;
    updateAnimationFrameIdText(animationState.isPlaying ? animationFrameId : undefined, showTimeAsSeconds);

    return {
      deltaTimeMs,
      absoluteTimeMs: timeMs,
      aboluteFrameId: aboluteFrameId - 1, // pre increment
      useSlerp,
      animationFrameId,
    };
  };
})();
