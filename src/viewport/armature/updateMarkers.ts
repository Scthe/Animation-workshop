import {mat4} from 'gl-mat4';
import {create as vec3_Create} from 'gl-vec3';
import {transformPointByMat4} from 'gl-utils';
import {Armature, Bone} from 'viewport/armature';
import {createMarkerPosition} from 'viewport/marker';
import {Scene, Object3d} from 'viewport/scene';

const getMarkerPosFromBone = (armature: Armature, mvp: mat4, modelMatrix: mat4) => (bone: Bone) => {
  const boneMat = bone.$_frameCache;
  const bonePos = bone.data.translation; // relative to parent

  // same steps as normal bone calculations, but on CPU this time
  const pos = vec3_Create(); // reverse bone transform
  transformPointByMat4(pos, bonePos, bone.getParentBindMatrix(armature));
  const localPos = vec3_Create(); // apply new bone transform
  transformPointByMat4(localPos, pos, boneMat);

  return createMarkerPosition(mvp, modelMatrix, localPos);
};

export const updateArmatureMarkers = (scene: Scene, object: Object3d) => {
  const {modelMatrix, bones} = object;
  const mvp = scene.getMVP(modelMatrix);
  const getMarkerFromBone_ = getMarkerPosFromBone(bones, mvp, modelMatrix);

  bones.forEach((bone: Bone, idx: number) => {
    const newPosition = getMarkerFromBone_(bone);
    scene.updateMarker(bone.name, newPosition);
  });
};
