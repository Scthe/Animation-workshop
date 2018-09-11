export enum Axis { AxisX, AxisY, AxisZ }
export const AxisList = [Axis.AxisX, Axis.AxisY, Axis.AxisZ]; // enums in TS are ..


export const getAxisVector = (axis: Axis) => {
  switch (axis) {
    case Axis.AxisX: return [1, 0, 0];
    case Axis.AxisY: return [0, 1, 0];
    case Axis.AxisZ: return [0, 0, 1];
  }
};
