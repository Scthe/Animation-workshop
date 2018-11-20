import {Armature, Bone} from 'viewport/armature';
import {Transform, resetTransform, addTransforms} from 'gl-utils';
import {GlState} from 'viewport/GlState';

interface InterpolateParams {
  glState: GlState;
  selectedObjectName: string;
  // animTimings: AnimTimings;
}

// TODO this method will set all properties based on initerpolation between keyframes
const interpolateTimeline = (t: Transform) => resetTransform(t);

const getDraggingDisplacement = (params: InterpolateParams, bone: Bone) => {
  const {selectedObjectName, glState: {draggingStatus}} = params;

  if (bone.name === selectedObjectName) {
    return draggingStatus.temporaryDisplacement;
  }
  return undefined;
};

const updateAnimTransform = (params: InterpolateParams) => (bone: Bone) => {
  const {animationTransform} = bone.getFrameCache();

  interpolateTimeline(animationTransform);

  const dragDisplacement = getDraggingDisplacement(params, bone);
  if (dragDisplacement) {
    addTransforms(animationTransform, dragDisplacement);
  }
};


export const interpolate = (params: InterpolateParams, bones: Armature) =>
  bones.forEach(updateAnimTransform(params));
