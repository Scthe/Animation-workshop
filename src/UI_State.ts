import {Marker} from './viewport/marker';
import {fromValues as vec3_Create, add as vAdd} from 'gl-vec3';
import {quat, create as quat_Create, multiply as qMul} from 'gl-quat';

let selectedObject: Marker;

export const setSelectedObject = (obj: Marker) => {
  selectedObject = obj;
};

export const getSelectedObject = () => {
  return selectedObject;
};

////////////////////
/// KEYFRAME STORAGE
////////////////////

let modMap: any = {};

const createEmptyKeyFrame = () => ({
  translation: vec3_Create(0, 0, 0),
  rotation: quat_Create(),
});

const getKeyframe = () => {
  const selectedObject  = getSelectedObject();
  if (!selectedObject) { return; }

  if (!modMap[selectedObject.name]) {
    modMap[selectedObject.name] = createEmptyKeyFrame();
  }

  return modMap[selectedObject.name];
};

////////////////////
/// MOVE
////////////////////

export const addMoveToSelectedObject = (moveVec: number[]) => {
  const keyframe = getKeyframe();
  vAdd(keyframe.translation, keyframe.translation, moveVec as any);
};

export const getMove = (marker: Marker) => {
  const mod = modMap[marker.name];
  if (!mod) { return vec3_Create(0, 0, 0); }
  return mod.translation;
};

////////////////////
/// ROTATE
////////////////////

export const addRotationToSelectedObject = (rotateQuat: quat) => {
  const keyframe = getKeyframe();
  qMul(keyframe.rotation, keyframe.rotation, rotateQuat);
};

export const getRotation = (marker: Marker) => {
  const mod = modMap[marker.name];
  if (!mod) { return quat_Create(); }
  return mod.rotation;
};
