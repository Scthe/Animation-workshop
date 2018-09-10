import {GltfLoader} from 'gltf-loader-ts';
import {fromValues as vec3_Create} from 'gl-vec3';
import {Shader, DrawParameters, DepthTest, CullingMode} from '../../gl-utils';
import {GlState} from '../GlState';
import {Marker} from '../marker';
import {initMoveGizmoDraw, drawMoveGizmo} from './moveGizmoDraw';
import {initRotationGizmoDraw, drawRotateGizmo} from './rotateGizmoDraw';

export * from './moveGizmoApply';
export * from './rotateGizmoApply';

export enum GizmoType {
  Move, Rotate, Scale
}

export enum GizmoAxis {
  AxisX, AxisY, AxisZ
}
export const GizmoAxisList = (() => {
  return ( // iterating over enum in TS is ...
    Object.keys(GizmoAxis)
     .map((k: any) => GizmoAxis[k])
     .filter(v => typeof v === 'number')) as any as GizmoAxis[];
})();

export const AXIS_COLORS = [
  vec3_Create(1, 0, 0),
  vec3_Create(0, 1, 0),
  vec3_Create(0, 0, 1)
];

let GIZMO_SHADER: Shader = undefined;


//////////
/// Some init stuff
//////////

// TODO rotate gizmo should have triangle/quad cross-cut
const GIZMO_VERT = require('shaders/gizmo.vert.glsl');
const GIZMO_FRAG = require('shaders/lampShader.frag.glsl');
const GIZMO_GLTF_URL = require('assets/gizmos.glb'); // TODO combine gltf files

export const initGizmoDraw = async (gl: Webgl) => {
  GIZMO_SHADER = new Shader(gl, GIZMO_VERT, GIZMO_FRAG);

  const loader = new GltfLoader();
  const asset = await loader.load(GIZMO_GLTF_URL);
  console.log('gizmo-asset', asset);
  console.log('gizmo-gltf', asset.gltf);

  await initMoveGizmoDraw(gl, GIZMO_SHADER, asset);
  await initRotationGizmoDraw(gl, GIZMO_SHADER, asset);
};


//////////
/// Actual drawing
/// NOTE: no instancing in webgl 1.0, have to use 3 draw calls (could mimic with uniforms, but meh..)
//////////

export interface GizmoDrawOpts {
  size: number;
  type: GizmoType;
  origin: Marker;
}

export const drawGizmo = (glState: GlState, opts: GizmoDrawOpts) => {
  if (!opts.origin) { return; }

  const dp = new DrawParameters();
  dp.depth.write = false;
  dp.depth.test = DepthTest.AlwaysPass;
  dp.culling = CullingMode.None;
  glState.setDrawState(dp);

  // drawMoveGizmo(glState, GIZMO_SHADER, opts);
  drawRotateGizmo(glState, GIZMO_SHADER, opts);
};
