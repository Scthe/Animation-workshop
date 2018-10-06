import {Timeline, Keyframe} from './index';

// TODO test me!
// NOTE: we require that timeline has keyframes SORTED by frameId

const getKeyframeBefore = (keyframes: Timeline, frameId: number, allowCurrent: boolean) => {
  const isExactCurrent = (k: Keyframe) => allowCurrent && k.frameId === frameId;
  const isBefore = (k: Keyframe) => k.frameId < frameId || isExactCurrent(k);

  let frameBeforeIdx = -1;
  keyframes.forEach((k: Keyframe, idx: number) => {
    // if they are nto sorted woud be: && isAfter(k, timeline[frameBeforeIdx])
    if (isBefore(k)) {
      frameBeforeIdx = idx;
    }
  });

  return frameBeforeIdx;
};

/**
 * get frame directly before `frameId` and one directly after
 * @param allowCurrent returned frames has to be different then current one
 */
 export const getNeighboursKeyframes = (
   keyframes: Timeline, frameId: number, allowCurrent: boolean
 ) => {
   const frameBeforeIdx = getKeyframeBefore(keyframes, frameId, allowCurrent);

   let keyframeAfter = keyframes[frameBeforeIdx + 1];
   const isAfterSameAsCurrent = keyframeAfter && keyframeAfter.frameId === frameId;
   if (!allowCurrent && isAfterSameAsCurrent) {
     keyframeAfter = keyframes[frameBeforeIdx + 2];
   }

   return [keyframes[frameBeforeIdx], keyframeAfter];
 };
