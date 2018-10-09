import {create as vec3_Create} from 'gl-vec3';
import {transformPointByMat4} from 'gl-utils';
import {Armature, Bone} from 'viewport/armature';
import {Scene, Object3d} from 'viewport/scene';

const getMarkerPosFromBone = (armature: Armature, bone: Bone) => {
  const boneMat = bone.$_frameCache;
  const bonePos = bone.data.translation; // relative to parent

  // same steps as normal bone calculations, but on CPU this time
  // reverse bone transform
  const pos = transformPointByMat4(vec3_Create(), bonePos, bone.getParentBindMatrix(armature));
  // apply new bone transform
  return transformPointByMat4(vec3_Create(), pos, boneMat);
};

export const updateArmatureMarkers = (scene: Scene, object: Object3d) => {
  const {modelMatrix, bones} = object;
  const mvp = scene.getMVP(modelMatrix);

  bones.forEach((bone: Bone, idx: number) => {
    const marker = scene.getMarker(bone.name);
    const pos = getMarkerPosFromBone(bones, bone);
    marker.updatePosition(pos, modelMatrix, mvp);
  });
};
