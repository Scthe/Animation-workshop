import {GltfLoader} from 'gltf-loader-ts';
import {fromValues as vec3_Create} from 'gl-vec3';
import {Shader, DrawParameters, DepthTest, CullingMode} from '../../gl-utils';
import {GlState} from '../GlState';
import {Marker} from '../marker';
import {initMoveGizmoDraw, drawMoveGizmo} from './move/draw';
import {initRotationGizmoDraw, drawRotateGizmo} from './rotate/draw';

export * from './move/draw';
export * from './move/handler';
export * from './rotate/draw';
export * from './rotate/handler';

// TODO combine gltf files


export enum GizmoType {
  Move, Rotate, Scale
}

export const AXIS_COLORS = [
  vec3_Create(1, 0, 0),
  vec3_Create(0, 1, 0),
  vec3_Create(0, 0, 1)
];

let GIZMO_SHADER: Shader = undefined;


//////////
/// Some init stuff
//////////

const GIZMO_VERT = require('shaders/gizmo.vert.glsl');
const GIZMO_FRAG = require('shaders/lampShader.frag.glsl');
const GIZMO_GLTF_URL = require('assets/gizmos.glb');

export const initGizmoDraw = async (gl: Webgl) => {
  GIZMO_SHADER = new Shader(gl, GIZMO_VERT, GIZMO_FRAG);

  const loader = new GltfLoader();
  const asset = await loader.load(GIZMO_GLTF_URL);
  // console.log('gizmo-asset', asset);
  // console.log('gizmo-gltf', asset.gltf);

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

  switch (opts.type) {
    case GizmoType.Move:
      drawMoveGizmo(glState, GIZMO_SHADER, opts);
      break;
    case GizmoType.Rotate:
      drawRotateGizmo(glState, GIZMO_SHADER, opts);
      break;
    // case GizmoType.Scale:
      // drawScaleGizmo(glState, GIZMO_SHADER, opts);
      // break;
  }
};
