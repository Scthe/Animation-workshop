import {fromValues as vec3_Create} from 'gl-vec3';

export enum Axis { AxisX, AxisY, AxisZ }
export const AxisList = [Axis.AxisX, Axis.AxisY, Axis.AxisZ]; // enums in TS are ..


export const getAxisVector = (axis: Axis) => {
  switch (axis) {
    case Axis.AxisX: return vec3_Create(1, 0, 0);
    case Axis.AxisY: return vec3_Create(0, 1, 0);
    case Axis.AxisZ: return vec3_Create(0, 0, 1);
  }
};
