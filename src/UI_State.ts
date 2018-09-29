import {Marker} from './viewport/marker';
import {vec3, fromValues as vec3_Create, add as vAdd} from 'gl-vec3';
import {quat, create as quat_Create, multiply as qMul} from 'gl-quat';

////////////////////
/// KEYFRAME STORAGE
////////////////////

let modMap: any = {};
(window as any).modMap = modMap;

const createEmptyKeyFrame = () => ({
  translation: vec3_Create(0, 0, 0),
  rotation: quat_Create(),
});

const getKeyframe = (objName: string) => {
  if (!modMap[objName]) {
    modMap[objName] = createEmptyKeyFrame();
  }

  return modMap[objName];
};

////////////////////
/// MOVE
////////////////////

export const addMove = (objName: string, moveVec: vec3) => {
  const keyframe = getKeyframe(objName);
  vAdd(keyframe.translation, keyframe.translation, moveVec);
};

export const getMove = (marker: Marker) => {
  return getKeyframe(marker.name).translation;
};

////////////////////
/// ROTATE
////////////////////

export const addRotation = (objName: string, rotateQuat: quat) => {
  const keyframe = getKeyframe(objName);
  qMul(keyframe.rotation, keyframe.rotation, rotateQuat);
};

export const getRotation = (marker: Marker) => {
  return getKeyframe(marker.name).rotation;
};
