import {GltfAsset} from 'gltf-loader-ts';
import {create as mat4_Create, identity, fromXRotation, fromZRotation} from 'gl-mat4';
import {Shader, setUniforms, toRadians, Axis, AxisList, createModelMatrix} from '../../../gl-utils';
import {GlState, ObjectGeometry} from '../../GlState';
import {readObject} from '../../readGltfObject';
import {AXIS_COLORS, GizmoDrawOpts} from '../index';
import {updateMarkers} from './updateMarkers';


// TODO make this draw as true local rotation it is, just premultiply getRotationMatrix's result
// TODO rotate gizmo should have triangle/quad cross-cut

let ROTATE_GIZMO_OBJ: ObjectGeometry = undefined;


//////////
/// Some init stuff
//////////

const MESH_NAME = 'GizmoRotation';

export const initRotationGizmoDraw = async (gl: Webgl, shader: Shader, asset: GltfAsset) => {
  ROTATE_GIZMO_OBJ = await readObject(gl, asset, shader, MESH_NAME, {
    'POSITION': 'a_Position'
  });
};


//////////
/// Gizmo drawing
//////////

const ANGLE_90_DGR = toRadians(90);

const getRotationMatrix = (axis: Axis) => {
  const rotateAxisMat = mat4_Create();

  switch (axis) {
    case Axis.AxisX:
      return fromZRotation(rotateAxisMat, ANGLE_90_DGR);
    case Axis.AxisY:
      return identity(rotateAxisMat);
    case Axis.AxisZ:
      return fromXRotation(rotateAxisMat, ANGLE_90_DGR);
  }
};

const getModelMatrix = (glState: GlState, axis: Axis, opts: GizmoDrawOpts) => {
  const {origin, size} = opts;
  const markerPos = origin.position.position3d;
  return createModelMatrix(markerPos, getRotationMatrix(axis), size);
};

const drawRotateAxis = (glState: GlState, shader: Shader, opts: GizmoDrawOpts) => (axis: Axis) => {
  const {gl} = glState;
  const {indicesGlType, triangleCnt} = ROTATE_GIZMO_OBJ;

  const modelMatrix = getModelMatrix(glState, axis, opts);
  const mvp = glState.getMVP(modelMatrix);

  setUniforms(gl, shader, {
    'g_Color': AXIS_COLORS[axis],
    'g_MVP': mvp,
  }, true);
  gl.drawElements(gl.TRIANGLES, triangleCnt * 3, indicesGlType, 0);
};

export const drawRotateGizmo = (glState: GlState, shader: Shader, opts: GizmoDrawOpts) => {
  const {gl} = glState;
  const {vao, indexBuffer} = ROTATE_GIZMO_OBJ;

  shader.use(gl);
  vao.bind(gl);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  const drawAxis = drawRotateAxis(glState, shader, opts);
  AxisList.map(drawAxis);
  updateMarkers(glState, opts);
};
