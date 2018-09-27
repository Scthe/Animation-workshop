import {Axis, AxisList} from 'gl-utils';

export enum Constraint { Allow, Disallow, } // AllowLocal, AllowGlobal

export const ALLOW_ALL = [Constraint.Allow, Constraint.Allow, Constraint.Allow];

export const DISALLOW_ALL = [Constraint.Disallow, Constraint.Disallow, Constraint.Disallow];

export const allowOnly = (axis: Axis) => AxisList.map(
  (a: Axis) => a === axis ? Constraint.Allow : Constraint.Disallow
);

type PerAxisConstraints = Constraint[]; // Per each axis

export interface Constraints {
  position: PerAxisConstraints;
  rotation: PerAxisConstraints;
  scale: PerAxisConstraints;
}
