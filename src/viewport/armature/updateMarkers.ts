import {mat4} from 'gl-mat4';
import {create as vec3_Create} from 'gl-vec3';
import {transformPointByMat4} from '../../gl-utils';
import {Armature, Bone} from '../armature';
import {MarkerType, createMarkerPosition} from '../marker';
import {GlState} from '../GlState';

const getMarkerPosFromBone = (armature: Armature, mvp: mat4, modelMatrix: mat4) => (bone: Bone, boneMat: mat4) => {
  const bonePos = bone.translation; // relative to parent

  // same steps as normal bone calculations, but on CPU this time
  const pos = vec3_Create(); // reverse bone transform
  transformPointByMat4(pos, bonePos, bone.getParentBindMatrix(armature));
  const localPos = vec3_Create(); // apply new bone transform
  transformPointByMat4(localPos, pos, boneMat);

  return createMarkerPosition(mvp, modelMatrix, localPos);
};

export const updateArmatureMarkers = (glState: GlState, armature: Armature, boneTransforms: mat4[], modelMatrix: mat4) => {
  const mvp = glState.getMVP(modelMatrix);
  const getMarkerFromBone_ = getMarkerPosFromBone(armature, mvp, modelMatrix);

  return boneTransforms.forEach((boneMat, idx) => {
    const bone = armature[idx];
    const newPosition = getMarkerFromBone_(bone, boneMat);
    glState.updateMarker(bone.name, MarkerType.Armature, newPosition);
  });
};
