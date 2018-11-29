import {numberToString} from 'gl-utils';

export * from './AnimTimings';
export * from './interpolate';
export * from './Keyframe';
export * from './interpolateKeyframe';

// this is not displayed fps, this is an internal value how densly the keyframes
// are stored.
export const ANIM_FPS = 24;

export const frameToAnimationSeconds = (frameId: number) => frameId / ANIM_FPS;
export const animationSecondsToFrame = (secondsSinceStart: number) => secondsSinceStart * ANIM_FPS;


// Small black rectangle in top left viewport corner
// that shows current animation time.
// It is visible even in fullscreen mode
const animationFrameIdTextEl = document.getElementById('animation-frame-id');

export const updateAnimationFrameIdText = (frameId: number, showTimeAsSeconds: boolean) => {
  const setDisplay = (val: string) => {
    if (animationFrameIdTextEl.style.display !== val) {
      animationFrameIdTextEl.style.display = val;
    }
  };

  if (frameId !== undefined) {
    setDisplay('block');
    const frameInProperUnit = showTimeAsSeconds ? frameToAnimationSeconds(frameId) : frameId;
    animationFrameIdTextEl.innerText = numberToString(frameInProperUnit, 1);
  } else {
    setDisplay('none');
  }
};
