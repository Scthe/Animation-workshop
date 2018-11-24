import {get} from 'lodash';
import {
  Transform,
  addTransforms, copyTransform, interpolateTransforms
} from 'gl-utils';
import {Armature, Bone} from 'viewport/armature';
import {GlState} from 'viewport/GlState';
import {getBoneConfig} from 'viewport/scene';
import {AnimTimings, Keyframe} from './index';
import {uiBridge} from 'state';

interface InterpolateParams {
  glState: GlState;
  selectedObjectName: string;
  animTimings: AnimTimings;
}

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

const interpolateTimeline = (timing: AnimTimings, t: Transform, bone: Bone) => {
  const {animationFrameId, useSlerp} = timing;

  const keyframe = uiBridge.getKeyframe(bone.name, animationFrameId);
  let keyframeTransform = get(keyframe, 'transform');

  if (!keyframeTransform) {
    const boneConfig = getBoneConfig(bone.name);
    const keyframeBefore = uiBridge.getKeyframeBefore(bone.name, animationFrameId);
    const keyframeBeforeTransform = get(keyframeBefore, 'transform', boneConfig.keyframe0);

    const keyframeAfter = uiBridge.getKeyframeAfter(bone.name, animationFrameId);
    const keyframeAfterTransform = get(keyframeAfter, 'transform', keyframeBeforeTransform);

    keyframeTransform = interpolateTransforms(
      keyframeBeforeTransform, keyframeAfterTransform,
      getKeyframeMod(keyframeBefore, keyframeAfter, animationFrameId),
      { useSlerp, }
    );
  }

  copyTransform(t, keyframeTransform);
};

const getDraggingDisplacement = (params: InterpolateParams, bone: Bone) => {
  const {selectedObjectName, glState: {draggingStatus}} = params;

  if (bone.name === selectedObjectName) {
    return draggingStatus.temporaryDisplacement;
  }
  return undefined;
};

const updateAnimTransform = (params: InterpolateParams) => (bone: Bone) => {
  const {animTimings} = params;
  const {animationTransform} = bone.getFrameCache();

  interpolateTimeline(animTimings, animationTransform, bone);

  const dragDisplacement = getDraggingDisplacement(params, bone);
  if (dragDisplacement) {
    addTransforms(animationTransform, dragDisplacement);
  }
};


export const interpolate = (params: InterpolateParams, bones: Armature) =>
  bones.forEach(updateAnimTransform(params));
