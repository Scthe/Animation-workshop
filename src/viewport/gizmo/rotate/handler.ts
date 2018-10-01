import {create as quat_Create, setAxisAngle} from 'gl-quat';
import {MouseDragEvent} from 'viewport/MouseHandler';
import {addRotation} from '../../../UI_Bridge';
import {toRadians, Axis, getAxisVector} from 'gl-utils';

export const applyGizmoRotate = (objName: string, ev: MouseDragEvent, axis: Axis) => {
  const axisVec = getAxisVector(axis);
  const rotation = setAxisAngle(quat_Create(), axisVec, toRadians(ev.delta[0] % 360));
  addRotation(objName, rotation);
};
