/** Animation timing etc. */
export interface AnimTimings {
  deltaTime: number; // previous -> this frame
  // animationFrameId: number; // frame to render, used for interpolation etc.
  frameId: number; // id of current frame

  // fromAnimStartMs: number
  // fromAnimStartFrame: number
}

export const createAnimTimings = ((timeOld: number, frameId: number) => (time: number) => {
  const animState = {
    deltaTime: time - timeOld,
    frameId,
  };
  timeOld = time;
  ++frameId;

  return animState;
})(0, 0);
