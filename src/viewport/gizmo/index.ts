import {fromValues as vec3_Create} from 'gl-vec3';

export * from './draw';
export * from './move/handler';
export * from './rotate/handler';


export enum GizmoType {
  Move, Rotate, Scale
}

export const AXIS_COLORS = [
  vec3_Create(1, 0, 0),
  vec3_Create(0, 1, 0),
  vec3_Create(0, 0, 1)
];
