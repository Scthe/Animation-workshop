import {MouseDragEvent} from 'viewport/MouseHandler';
import {addMove} from '../../../UI_State';
import {Axis, getAxisVector} from 'gl-utils';

export const applyGizmoMove = (objName: string, ev: MouseDragEvent, axis: Axis) => {
  const axisVec = getAxisVector(axis);

  const speed = ev.delta[0] / 200;
  const moveVector = axisVec.map(e => e * speed);
  addMove(objName, moveVector as any);
};
