import {GizmoAxis} from './index';
import {MouseDragEvent} from '../MouseHandler';
import {addRotationToSelectedObject} from '../../UI_State';
import {quat, create as quat_Create, rotateX, setAxisAngle} from 'gl-quat';
import {toRadians} from '../../gl-utils';

const getRotationAxis = (axis: GizmoAxis) => {
  switch (axis) {
    case GizmoAxis.AxisX: return [1, 0, 0];
    case GizmoAxis.AxisY: return [0, 1, 0];
    case GizmoAxis.AxisZ: return [0, 0, 1];
  }
};

export const applyGizmoRotate = (ev: MouseDragEvent, axis: GizmoAxis) => {
  const rotation = quat_Create();
  const axisV = getRotationAxis(axis);
  setAxisAngle(rotation, axisV, toRadians(ev.delta[0] % 360));
  addRotationToSelectedObject(rotation);
};
