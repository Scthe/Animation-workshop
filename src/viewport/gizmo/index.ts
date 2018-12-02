import {fromValues as vec3_Create} from 'gl-vec3';

export * from './draw';


// about right in the middle of the tip
export const GIZMO_MOVE_TIP = vec3_Create(0, 0.9, 0);


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
