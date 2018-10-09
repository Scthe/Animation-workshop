import {fromValues as vec3_Create} from 'gl-vec3';
import {MouseDragEvent} from 'viewport/MouseHandler';
import {Axis} from 'gl-utils';

export * from './draw';
export * from './handler';


// about right in the middle of the tip
export const GIZMO_MOVE_TIP = vec3_Create(0, 0.9, 0);


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
