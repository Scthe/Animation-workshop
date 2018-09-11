import {mat4} from 'gl-mat4';
import {vec3, create as vec3_Create} from 'gl-vec3';
import {vec2, fromValues as vec2_Create} from 'gl-vec2';
import {transformPointByMat4} from '../../gl-utils';

export * from './drawMarkers';
export * from './getMarkerRadius';
export * from './getMarkerAt';


// Marker:
// rendered as dot in viewport, indicates e.g. selectable bone or object
// Used also for gizmo click-handling etc.


export enum MarkerType {
  Armature, Object, GizmoMove, GizmoRotate
}

// changes per frame
export interface MarkerPosition {
  position3d: vec3; // used for gizmo placement
  positionNDC: vec2; // NOTE: in NDC(!!!): [-1, 1] x [-1, 1]
}

export interface Marker {
  name: string;
  type: MarkerType;
  position: MarkerPosition;
  radius?: number;
  color?: vec3;
}

export const createMarkerPosition = (mvp: mat4, modelMatrix: mat4, pos: vec3) => {
  const resultNDC = vec3_Create();
  transformPointByMat4(resultNDC, pos, mvp);

  const position3d = vec3_Create();
  transformPointByMat4(position3d, pos, modelMatrix);

  return {
    position3d,
    positionNDC: vec2_Create(resultNDC[0], resultNDC[1]),
  };
};
