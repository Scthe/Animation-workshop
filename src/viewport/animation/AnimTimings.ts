import {uiBridge, appStateGetter} from 'state';

/** Animation timing etc. */
export interface AnimTimings {
  // previous -> this frame
  deltaTime: number;

  // id of frame to render (in range of previewRange). Used for interpolation etc.
  animationFrameId: number;

  // id of current frame counting from app start
  aboluteFrameId: number;

  // lerp/slerp interpolation for rotation
  useSlerp: boolean;

  // fromAnimStartMs: number
  // fromAnimStartFrame: number
}


// 'do expressions' not supported in TS ATM
export const createAnimTimings = (() => {
  let timeOld = 0;
  let aboluteFrameId = 0;

  return (time: number): AnimTimings => {
    const deltaTime = time - timeOld;
    timeOld = time;

    ++aboluteFrameId;

    const {currentFrame, useSlerp} = uiBridge.getFromUI(
      appStateGetter('currentFrame', 'useSlerp')
    );

    return {
      deltaTime,
      aboluteFrameId: aboluteFrameId - 1, // pre increment
      animationFrameId: currentFrame,
      useSlerp,
    };
  };
})();
