import {GltfLoader} from 'gltf-loader-ts';
import {fromValues as vec3_Create} from 'gl-vec3';
import {
  create as mat4_Create,
  fromTranslation, fromXRotation, fromZRotation, fromScaling,
  multiply
} from 'gl-mat4';
import {
  Shader,
  setUniforms, DrawParameters, DepthTest, CullingMode,
  toRadians
} from '../gl-utils';
import {GlState} from './GlState';
import {readObject} from './readGltfObject';
import {Marker, updateMoveGizmoMarker} from './marker';


// TODO separate folder, split Move/Rotate/Scale into files. maybe class in index.ts?

const GIZMO_GLTF_URL = require('assets/gizmos.glb'); // TODO combine gltf files

export enum GizmoType {
  Move // , Rotate, Scale
}

// gizmo to move/rotate/scale in 3 axis, we draw 1 by 1
export enum GizmoAxis {
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
/// Move gizmo
//////////

const getMoveRotationMatrix = (glState: GlState, axis: GizmoAxis) => {
  const cameraPos = glState.camera.getPosition();
  const rotateAxisMat = mat4_Create();
  let isNegative: number; // fun thing, no one said that {True, False} has to be boolean

  switch (axis) {
    case GizmoAxis.AxisX:
      isNegative = cameraPos[0] >= 0 ? -1 : 1;
      return fromZRotation(rotateAxisMat, ANGLE_90_DGR * isNegative);
    case GizmoAxis.AxisY:
      isNegative = cameraPos[1] >= 0 ? 0 : 2;
      return fromXRotation(rotateAxisMat, ANGLE_90_DGR * isNegative);
    case GizmoAxis.AxisZ:
      isNegative = cameraPos[2] > 0 ? 1 : -1;
      return fromXRotation(rotateAxisMat, ANGLE_90_DGR * isNegative);
  }
};

const getMoveModelMatrix = (glState: GlState, axis: GizmoAxis, opts: GizmoDrawOpts) => {
  const rotateAxisMat = getMoveRotationMatrix(glState, axis);

  const moveMat = mat4_Create();
  fromTranslation(moveMat, opts.origin.position.position3d);

  const scaleMat = mat4_Create();
  fromScaling(scaleMat, vec3_Create(opts.size, opts.size, opts.size));

  const tmp = mat4_Create();
  const result = mat4_Create();
  multiply(tmp, moveMat, rotateAxisMat);
  multiply(result, tmp, scaleMat);

  return result;
};

const drawMoveArrow = (glState: GlState, opts: GizmoDrawOpts) => (axis: GizmoAxis) => {
  const {gl, gizmoShader: shader, gizmoMoveGeometry: geo} = glState;
  const {indicesGlType, triangleCnt} = geo;

  const modelMatrix = getMoveModelMatrix(glState, axis, opts);
  const mvp = glState.getMVP(modelMatrix);

  setUniforms(gl, shader, {
    'g_Color': AXIS_COLORS[axis],
    'g_MVP': mvp,
  }, true);
  gl.drawElements(gl.TRIANGLES, triangleCnt * 3, indicesGlType, 0);

  // marker:
  updateMoveGizmoMarker(glState, mvp, modelMatrix, axis);
};

const drawMoveGizmo = (glState: GlState, opts: GizmoDrawOpts) => {
  const {gl, gizmoShader: shader, gizmoMoveGeometry: geo} = glState;
  const {vao, indexBuffer} = geo;

  shader.use(gl);
  vao.bind(gl);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  const drawAxis = drawMoveArrow(glState, opts);
  GizmoAxisList.forEach(drawAxis);
};

//////////
/// Actual drawing
/// NOTE: no instancing in webgl 1.0, have to use 3 draw calls (could mimic with uniforms, but meh..)
//////////

interface GizmoDrawOpts {
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

  drawMoveGizmo(glState, opts);
};
