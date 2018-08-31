import {GltfLoader} from 'gltf-loader-ts';
import {vec3, fromValues as vec3_Create} from 'gl-vec3';
import {
  create as mat4_Create,
  fromTranslation, fromXRotation, fromZRotation, fromScaling,
  multiply
} from 'gl-mat4';
import {Shader, setUniforms, DrawParameters, DepthTest, CullingMode, toRadians} from '../gl-utils';
import {GlState} from './GlState';
import {readObject} from './readGltfObject';

const GIZMO_GLTF_URL = require('assets/gizmos.glb'); // TODO combine gltf files

export enum GizmoType {
  Move // , Rotate, Scale
}

//////////
/// Some init stuff
//////////

export const createGizmoGeo = async (gl: Webgl, shader: Shader) => {
  const loader = new GltfLoader();
  const asset = await loader.load(GIZMO_GLTF_URL);
  console.log('gizmo-asset', asset);
  console.log('gizmo-gltf', asset.gltf);

  // TODO only move for now
  return readObject(gl, asset, shader, 'GizmoArrow', {
    'POSITION': 'a_Position'
  });
};

//////////
/// Actual drawing
/// NOTE: no instancing in webgl 1.0, have to use 3 draw calls (could mimic with uniforms, but meh..)
//////////

// gizmo to move/rotate/scale in 3 axis, we draw 1 by 1
enum GizmoAxis {
  AxisX, AxisY, AxisZ
}
const AXIS_COLORS = [vec3_Create(1, 0, 0), vec3_Create(0, 1, 0), vec3_Create(0, 0, 1)];
const GizmoAxisList = (() => {
  return ( // iterating over enum in TS is ...
    Object.keys(GizmoAxis)
     .map((k: any) => GizmoAxis[k])
     .filter(v => typeof v === 'number')) as any as GizmoAxis[];
})();

const ANGLE_90_DGR = toRadians(90);

const getGizmoModelMatrix = (glState: GlState, axis: GizmoAxis, opts: GizmoDrawOpts) => {
  const cameraPos = glState.camera.getPosition();
  const rotateAxisMat = mat4_Create();

  switch (axis) {
    case GizmoAxis.AxisX: {
      const isNegative = cameraPos[0] >= 0 ? -1 : 1;
      fromZRotation(rotateAxisMat, ANGLE_90_DGR * isNegative);
      break; }
    case GizmoAxis.AxisY: {
      const isNegative = cameraPos[1] >= 0 ? 0 : 2;
      fromXRotation(rotateAxisMat, ANGLE_90_DGR * isNegative);
      break; }
    case GizmoAxis.AxisZ: {
      const isNegative = cameraPos[2] > 0 ? 1 : -1;
      fromXRotation(rotateAxisMat, ANGLE_90_DGR * isNegative);
      break; }
  }

  const moveMat = mat4_Create();
  fromTranslation(moveMat, opts.origin);

  const scaleMat = mat4_Create();
  fromScaling(scaleMat, vec3_Create(opts.size, opts.size, opts.size));

  const tmp = mat4_Create();
  const result = mat4_Create();
  multiply(tmp, moveMat, rotateAxisMat);
  multiply(result, tmp, scaleMat);

  return result;
};

const drawMoveGizmo = (glState: GlState, opts: GizmoDrawOpts) => {
  const {gl, gizmoShader: shader, gizmoMoveGeometry: geo} = glState;
  const {vao, indicesGlType, indexBuffer, triangleCnt} = geo;

  shader.use(gl);
  vao.bind(gl);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  GizmoAxisList.forEach(axis => {
    const modelMatrix = getGizmoModelMatrix(glState, axis, opts);
    setUniforms(gl, shader, {
      'g_Color': AXIS_COLORS[axis],
      'g_MVP': glState.getMVP(modelMatrix),
    }, true);
    gl.drawElements(gl.TRIANGLES, triangleCnt * 3, indicesGlType, 0);
  });
};

interface GizmoDrawOpts {
  origin: vec3;
  size: number;
  type: GizmoType;
}

export const drawGizmo = (glState: GlState, opts: GizmoDrawOpts) => {
  const dp = new DrawParameters();
  dp.depth.write = false;
  dp.depth.test = DepthTest.AlwaysPass;
  dp.culling = CullingMode.None;
  glState.setDrawState(dp);

  // TODO how to produce markers from this?
  drawMoveGizmo(glState, opts);
};
