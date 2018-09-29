import {fromValues as vec3_Create} from 'gl-vec3';
import {DrawParameters, DepthTest, CullingMode} from 'gl-utils';
import {FrameEnv} from 'viewport/main';
import {Marker, MarkerType} from 'viewport/marker';
import {drawMoveGizmo} from './move/draw';
import {drawRotateGizmo} from './rotate/draw';

export * from './move/draw';
export * from './move/handler';
export * from './rotate/draw';
export * from './rotate/handler';


export enum GizmoType {
  Move, Rotate, Scale
}

export const AXIS_COLORS = [
  vec3_Create(1, 0, 0),
  vec3_Create(0, 1, 0),
  vec3_Create(0, 0, 1)
];


export interface GizmoDrawOpts {
  size: number;
  type: GizmoType;
  origin: Marker; // need whole marker for rotation
}

export const drawGizmo = (frameEnv: FrameEnv, opts: GizmoDrawOpts) => {
  if (opts.origin.type !== MarkerType.Bone) {
    throw `Could not draw gizmo at unsupported origin (expected MarkerType.Bone)`;
  }

  const dp = new DrawParameters();
  dp.depth.write = false;
  dp.depth.test = DepthTest.AlwaysPass;
  dp.culling = CullingMode.None;
  frameEnv.glState.setDrawState(dp);

  switch (opts.type) {
    case GizmoType.Move:
      drawMoveGizmo(frameEnv, opts);
      break;
    case GizmoType.Rotate:
      drawRotateGizmo(frameEnv, opts);
      break;
    // case GizmoType.Scale:
      // drawScaleGizmo(glState, GIZMO_SHADER, opts);
      // break;
  }
};
