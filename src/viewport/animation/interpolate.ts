import {Transform, addTransforms, copyTransform} from 'gl-utils';
import {Armature, Bone} from 'viewport/armature';
import {GlState} from 'viewport/GlState';
import {getBoneConfig} from 'viewport/scene';
import {AnimTimings, interpolateKeyframe} from './index';
import {uiBridge} from 'state';

interface InterpolateParams {
  glState: GlState;
  selectedObjectName: string;
  animTimings: AnimTimings;
}

const interpolateTimeline = (timing: AnimTimings, out: Transform, bone: Bone) => {
  const {animationFrameId, useSlerp} = timing;
  const boneConfig = getBoneConfig(bone.name);
  const timeline = uiBridge.getTimeline(bone.name);

  const keyframeTransform = interpolateKeyframe(
    timeline, animationFrameId, boneConfig.keyframe0, {useSlerp}
  );
  copyTransform(out, keyframeTransform);
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
  const animationTransform = bone.$frameTransform;

  interpolateTimeline(animTimings, animationTransform, bone);

  const dragDisplacement = getDraggingDisplacement(params, bone);
  if (dragDisplacement) {
    addTransforms(animationTransform, dragDisplacement);
  }
};


export const interpolate = (params: InterpolateParams, bones: Armature) =>
  bones.forEach(updateAnimTransform(params));
