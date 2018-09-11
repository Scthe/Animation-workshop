import {GltfAsset} from 'gltf-loader-ts';
import {vec3} from 'gl-vec3';
import {create as mat4_Create, fromXRotation, fromZRotation} from 'gl-mat4';
import {Shader, setUniforms, toRadians, Axis, AxisList, createModelMatrix} from '../../../gl-utils';
import {GlState, ObjectGeometry} from '../../GlState';
import {readObject} from '../../readGltfObject';
import {updateMarkers} from './updateMarkers';
import {AXIS_COLORS, GizmoDrawOpts} from '../index';


let MOVE_GIZMO_OBJ: ObjectGeometry = undefined;


//////////
/// Some init stuff
//////////

const MESH_NAME = 'GizmoArrow';

export const initMoveGizmoDraw = async (gl: Webgl, shader: Shader, asset: GltfAsset) => {
  MOVE_GIZMO_OBJ = await readObject(gl, asset, shader, MESH_NAME, {
    'POSITION': 'a_Position'
  });
};


//////////
/// Gizmo drawing
//////////

const ANGLE_90_DGR = toRadians(90);

const getRotationMatrix = (glState: GlState, axis: Axis, markerPos: vec3) => {
  const cameraPos = glState.camera.getPosition();
  const delta = [
    markerPos[0] - cameraPos[0],
    markerPos[1] - cameraPos[1],
    markerPos[2] - cameraPos[2]
  ];
  const rotateAxisMat = mat4_Create();
  let isNegative: number; // fun thing, no one said that {True, False} has to be boolean

  switch (axis) {
    case Axis.AxisX:
      isNegative = delta[0] >= 0 ? 1 : -1;
      return fromZRotation(rotateAxisMat, ANGLE_90_DGR * isNegative);
    case Axis.AxisY:
      isNegative = delta[1] >= 0 ? 2 : 0;
      return fromXRotation(rotateAxisMat, ANGLE_90_DGR * isNegative);
    case Axis.AxisZ:
      isNegative = delta[2] > 0 ? -1 : 1;
      return fromXRotation(rotateAxisMat, ANGLE_90_DGR * isNegative);
  }
};

const getModelMatrix = (glState: GlState, axis: Axis, opts: GizmoDrawOpts) => {
  const {origin, size} = opts;
  const markerPos = origin.position.position3d;
  const rotateAxisMat = getRotationMatrix(glState, axis, markerPos);
  return createModelMatrix(markerPos, rotateAxisMat, size);
};

const drawMoveArrow = (glState: GlState, shader: Shader, opts: GizmoDrawOpts) => (axis: Axis) => {
  const {gl} = glState;
  const {indicesGlType, triangleCnt} = MOVE_GIZMO_OBJ;

  const modelMatrix = getModelMatrix(glState, axis, opts);
  const mvp = glState.getMVP(modelMatrix);

  setUniforms(gl, shader, {
    'g_Color': AXIS_COLORS[axis],
    'g_MVP': mvp,
  }, true);
  gl.drawElements(gl.TRIANGLES, triangleCnt * 3, indicesGlType, 0);

  // marker:
  updateMarkers(glState, mvp, modelMatrix, axis);
};

export const drawMoveGizmo = (glState: GlState, shader: Shader, opts: GizmoDrawOpts) => {
  const {gl} = glState;
  const {vao, indexBuffer} = MOVE_GIZMO_OBJ;

  shader.use(gl);
  vao.bind(gl);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  const drawAxis = drawMoveArrow(glState, shader, opts);
  AxisList.forEach(drawAxis);
};
