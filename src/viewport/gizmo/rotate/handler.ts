import {create as quat_Create, setAxisAngle} from 'gl-quat';
import {MouseDragEvent} from 'viewport/MouseHandler';
import {addRotationToSelectedObject} from '../../../UI_State';
import {toRadians, Axis, getAxisVector} from 'gl-utils';

// TODO for global, just premultiply by ~boneQuat or smth.

export const applyGizmoRotate = (ev: MouseDragEvent, axis: Axis) => {
  const axisVec = getAxisVector(axis);
  const rotation = quat_Create();
  setAxisAngle(rotation, axisVec, toRadians(ev.delta[0] % 360));
  addRotationToSelectedObject(rotation);
};
