import {quat, create as quat_Create, setAxisAngle} from 'gl-quat';
import {getAxisVector} from 'gl-utils';
import {GizmoHandleDragEvent} from './utils';


const ROTATE_SENSITIVITY = 1 / 100;

// I don't have patience to deal with this ATM,
// so it is very simple for now
export const applyGizmoRotate = (event: GizmoHandleDragEvent): quat => {
  const {mouseEvent, axis} = event;

  const rotateAxisVector = getAxisVector(axis);
  const deltaAngle = mouseEvent.totalDelta[0] * ROTATE_SENSITIVITY;
  const q = setAxisAngle(quat_Create(), rotateAxisVector, deltaAngle);

  return q;
};
