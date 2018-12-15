import {Axis, AxisList} from 'gl-utils';
import {GizmoType, GIZMO_TYPE_LIST} from 'viewport/gizmo';
import some from 'lodash-es/some';

/// most of this file is opaque to 3rd party
/// (with exception for config.ts that uses this stuff)

type PerAxisConstraints = Axis[]; // impl: array of allowed axes

export interface Constraints {
  position: PerAxisConstraints;
  rotation: PerAxisConstraints;
  scale: PerAxisConstraints;
}


export const ALLOW_ALL = [Axis.AxisX, Axis.AxisZ, Axis.AxisY];

export const DISALLOW_ALL = [] as PerAxisConstraints;

export const allowOnly = (axis: Axis) => [axis];

export const disallowOnly = (axis: Axis) => AxisList.filter(a => a !== axis);


/////////////////////
/// API for 3rd party
/////////////////////

export const getAxisConstraints = (gizmo: GizmoType, constraints: Constraints) => {
  switch (gizmo) {
    case GizmoType.Move:   return constraints.position;
    case GizmoType.Rotate: return constraints.rotation;
    case GizmoType.Scale:  return constraints.scale;
  }
};

export const isAxisAllowed = (axis: Axis, gizmo: GizmoType, constraints: Constraints) => {
  const axisConstraints = getAxisConstraints(gizmo, constraints);
  return axisConstraints.indexOf(axis) !== -1;
};

export const isAnyAxisAllowed = (gizmo: GizmoType, constraints: Constraints) => {
  return some(AxisList, axis => isAxisAllowed(axis, gizmo, constraints));
};

export const getActionableGizmo = (constraints: Constraints) => {
  return GIZMO_TYPE_LIST.find(type => isAnyAxisAllowed(type, constraints));
};
