import {fromValues as vec3_Create} from 'gl-vec3';

export * from './draw';


// only for viewport purposes, will make handles much easier to click
const GIZMO_MOVE_R_HANDICAP = 2;
// real radius
const GIZMO_MOVE_R = 0.1;
export const GIZMO_MOVE_RADIUS = GIZMO_MOVE_R * GIZMO_MOVE_R_HANDICAP;
// about right in the middle of the tip
const GIZMO_MOVE_TIP_Y = 1.0 - (2 * GIZMO_MOVE_R);
export const GIZMO_MOVE_TIP = vec3_Create(0, GIZMO_MOVE_TIP_Y, 0);


export enum GizmoType {
  Move, Rotate, Scale
}

export const GIZMO_TYPE_LIST = [
  GizmoType.Move, GizmoType.Rotate, GizmoType.Scale
];

export const AXIS_COLORS = [
  vec3_Create(1, 0, 0),
  vec3_Create(0, 1, 0),
  vec3_Create(0, 0, 1)
];
