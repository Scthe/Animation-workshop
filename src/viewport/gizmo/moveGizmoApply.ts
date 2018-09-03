import {GizmoAxis} from './index';
import {MouseDragEvent} from '../MouseHandler';
import {addMoveToSelectedObject} from '../../UI_State';

const getNormalizedMoveAxisVector = (axis: GizmoAxis) => {
  switch (axis) {
    case GizmoAxis.AxisX: return [1, 0, 0];
    case GizmoAxis.AxisY: return [0, 1, 0];
    case GizmoAxis.AxisZ: return [0, 0, 1];
  }
};

export const applyGizmoMove = (ev: MouseDragEvent, axis: GizmoAxis) => {
  const speed = ev.delta[0] / 200;
  const axisDir = getNormalizedMoveAxisVector(axis);
  const moveVector = axisDir.map(e => e * speed);
  addMoveToSelectedObject(moveVector);
};
