import get from 'lodash-es/get';
import {Transform, interpolateTransforms, InterpolateOpts} from 'gl-utils';
import {
  Keyframe, Timeline,
  getKeyframeAt, getKeyframeBefore, getKeyframeAfter
} from './index';

const getKeyframeMod = (keyframeA: Keyframe, keyframeB: Keyframe, frameId: number) => {
  const timeA = get(keyframeA, 'frameId', 0);
  const timeB = get(keyframeB, 'frameId', 0);
  const delta = timeB - timeA;

  if (delta === 0) { // happens when e.g. no keyframes at all and both use keyrame0
    return 1.0;
  }

  // inb4 off by one
  return (frameId - timeA) / delta;
};

export const interpolateKeyframe = (
  timeline: Timeline, frameId: number, keyframe0: Transform, opts: InterpolateOpts
) => {
  const keyframe = getKeyframeAt(timeline, frameId);
  let keyframeTransform = get(keyframe, 'transform');

  if (!keyframeTransform) {
    const keyframeBefore = getKeyframeBefore(timeline, frameId);
    const keyframeBeforeTransform = get(keyframeBefore, 'transform', keyframe0);

    const keyframeAfter = getKeyframeAfter(timeline, frameId);
    const keyframeAfterTransform = get(keyframeAfter, 'transform', keyframeBeforeTransform);

    keyframeTransform = interpolateTransforms(
      keyframeBeforeTransform, keyframeAfterTransform,
      getKeyframeMod(keyframeBefore, keyframeAfter, frameId),
      opts
    );
  }

  return keyframeTransform;
};
