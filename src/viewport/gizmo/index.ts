import {fromValues as vec3_Create} from 'gl-vec3';
import {MouseDragEvent} from 'viewport/MouseHandler';
import {Axis} from 'gl-utils';

export * from './draw';
export * from './handler';


export enum GizmoType {
  Move, Rotate, Scale
}

export const AXIS_COLORS = [
  vec3_Create(1, 0, 0),
  vec3_Create(0, 1, 0),
  vec3_Create(0, 0, 1)
];

export interface GizmoAxisDragEvent {
  mouseEvent: MouseDragEvent;
  axis: Axis;
}
