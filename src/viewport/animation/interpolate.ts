import {get} from 'lodash';
import {Armature, Bone} from 'viewport/armature';
import {Transform, addTransforms, copyTransform, POS_ROT_SCALE_0} from 'gl-utils';
import {GlState} from 'viewport/GlState';
import {uiBridge} from 'state';

interface InterpolateParams {
  glState: GlState;
  selectedObjectName: string;
  // animTimings: AnimTimings;
}

// TODO this method will set all properties based on initerpolation between keyframes
const interpolateTimeline = (t: Transform, bone: Bone) => {
  const interpolatedKeyframe = uiBridge.getCurrentKeyframe(bone.name);
  const keyframeTransform = get(interpolatedKeyframe, 'transform', POS_ROT_SCALE_0);
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
  const {animationTransform} = bone.getFrameCache();

  interpolateTimeline(animationTransform, bone);

  const dragDisplacement = getDraggingDisplacement(params, bone);
  if (dragDisplacement) {
    addTransforms(animationTransform, dragDisplacement);
  }
};


export const interpolate = (params: InterpolateParams, bones: Armature) =>
  bones.forEach(updateAnimTransform(params));
