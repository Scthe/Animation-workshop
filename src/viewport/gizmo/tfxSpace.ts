import {vec3, create as vec3_0, normalize} from 'gl-vec3';
import {create as mat4_Create, multiply, fromQuat} from 'gl-mat4';
import {Axis, getAxisVector, transformPointByMat4, subtractNorm} from 'gl-utils';
import {Bone} from 'viewport/armature';

export const getGizmoDrawModelMatrix = (bone: Bone) => {
  return multiply(mat4_Create(), bone.$frameMatrix, bone.data.bindMatrix);
};

export const getWorldAxis = (bone: Bone, axis: Axis): vec3 => {
  const objPos = bone.marker.$position3d;
  const moveAxisLocalSpace = getAxisVector(axis);

  const mat = bone.getFrameCache().globalTransform;
  const gizmoPosition = transformPointByMat4(moveAxisLocalSpace, mat, true);
  return subtractNorm(gizmoPosition, objPos);
};

export const getLocalAxis = (bone: Bone, axis: Axis): vec3 => {
  const moveAxisLocalSpace = getAxisVector(axis);

  // only the rotation! and local frame at that
  const mat = fromQuat(mat4_Create(), bone.$frameTransform.rotation);
  const gizmoPosition = transformPointByMat4(moveAxisLocalSpace, mat, true);
  return normalize(vec3_0(), gizmoPosition);
};
