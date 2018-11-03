import {transformPointByMat4} from 'gl-utils';
import {Armature, Bone} from 'viewport/armature';
import {Scene, Object3d} from 'viewport/scene';


const getMarkerPosFromBone = (armature: Armature, bone: Bone) => {
  const boneMat = bone.$_frameCache;
  const parentBindMat = bone.getParentBindMatrix(armature);

  // bone.translation is bone offset relative to parent
  // by transforming through parent matrix we can
  // calculate final position
  const bonePos = bone.data.translation;

  // same steps as normal bone calculations, but on CPU this time
  // 1) reverse bone transform
  const pos1 = transformPointByMat4(bonePos, parentBindMat, true);
  // 2) apply new bone transform
  const pos2 = transformPointByMat4(pos1, boneMat, true);

  return pos2;
};

export const updateArmatureMarkers = (scene: Scene, object: Object3d) => {
  const {modelMatrix, bones} = object;
  const mvp = scene.getMVP(modelMatrix);

  bones.forEach((bone: Bone) => {
    const marker = scene.getMarker(bone.name);
    const pos = getMarkerPosFromBone(bones, bone);
    marker.updatePosition(pos, modelMatrix, mvp);
  });
};
