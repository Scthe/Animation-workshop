import {Marker} from './viewport/structs';
import {fromValues as vec3_Create, add} from 'gl-vec3';

let selectedObject: Marker;

export const setSelectedObject = (obj: Marker) => {
  selectedObject = obj;
};

export const getSelectedObject = () => {
  return selectedObject;
};

const ZERO_TRANSLATION = vec3_Create(0, 0, 0);

let modMap: any = {};

const createEmptyKeyFrame = () => ({
  translation: ZERO_TRANSLATION,
});

export const addMoveToSelectedObject = (moveVec: number[]) => {
  const selectedObject  = getSelectedObject();
  if (!selectedObject) { return; }

  if (!modMap[selectedObject.name]) {
    modMap[selectedObject.name] = createEmptyKeyFrame();
  }

  const keyframe = modMap[selectedObject.name];
  add(keyframe.translation, keyframe.translation, moveVec as any);
};

export const getMove = (marker: Marker) => {
  const mod = modMap[marker.name];
  if (!mod) { return ZERO_TRANSLATION; }
  return mod.translation;
};
