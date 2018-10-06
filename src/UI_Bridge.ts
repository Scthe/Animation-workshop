import {Marker} from './viewport/marker';
import {vec3, create as vec3_Create, add as vAdd} from 'gl-vec3';
import {quat, create as quat_Create, multiply as qMul} from 'gl-quat';

////////////////////
/// KEYFRAME STORAGE
////////////////////

let modMap: any = {};
(window as any).modMap = modMap;

const createEmptyKeyFrame = () => ({
  translation: vec3_Create(),
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

/////////////////

import {AppState, appState, TimelineState, timelineState} from 'ui/state';

export {AppState, TimelineState}; // easier imports. still, ugh..

// normally in mobx You would add a reaction to bridge the imperative code
// with state. Since we are running infinite loop, we are going to just
// use getters instead

export interface UIState {
  appState: AppState;
  timelineState: TimelineState;
}

type FromStateGetter<T> = <T> (uiState: UIState) => T;
type FromStateSetter = (uiState: UIState) => void;

export const appStateGetter = (...propNames: string[]) => {
  return (uiState: UIState) => {
    const {appState} = uiState; // You do not want to know what syntax TS forces to destructure this as parameter
    // we forgo typing with this, but well...
    const res = {} as any;
    propNames.forEach(key => res[key] = (appState as any)[key]);
    return res;
  };
};

export const appStateSetter = (key: string, value: any) => {
  return (uiState: UIState) => {
    const {appState} = uiState;
    (appState as any)[key] = value;
  };
};

class UIBridge {

  getFromUI <T> (getter: FromStateGetter<T>): T {
    return getter(this.getStateAsObject());
  }

  setOnUI (setter: FromStateSetter) {
    // just in case
    (window as any).requestAnimationFrame(() => {
      setter(this.getStateAsObject());
    });
  }

  private getStateAsObject () {
    return { appState, timelineState, };
  }
}

export const uiBridge = new UIBridge();
