import {MouseDragEvent} from '../../MouseHandler';
import {addMoveToSelectedObject} from '../../../UI_State';
import {Axis, getAxisVector} from '../../../gl-utils';

export const applyGizmoMove = (ev: MouseDragEvent, axis: Axis) => {
  const axisVec = getAxisVector(axis);

  const speed = ev.delta[0] / 200;
  const moveVector = axisVec.map(e => e * speed);
  addMoveToSelectedObject(moveVector);
};
