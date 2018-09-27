import {GltfAsset} from 'gltf-loader-ts';
import {create as mat4_Create, identity, fromXRotation, fromZRotation} from 'gl-mat4';
import {Shader, setUniforms, toRadians, Axis, AxisList, createModelMatrix} from 'gl-utils';
import {GlState} from 'viewport/GlState';
import {FrameEnv} from 'viewport/main';
import {AXIS_COLORS, GizmoDrawOpts} from '../index';
import {updateMarkers} from './updateMarkers';
import {Mesh, getNode, loadMesh} from 'viewport/scene';


// TODO make this draw as true local rotation it is, just premultiply getRotationMatrix's result
// TODO rotate gizmo should have triangle/quad cross-cut

let ROTATE_GIZMO_OBJ: Mesh = undefined;


//////////
/// Some init stuff
//////////

const MESH_NAME = 'GizmoRotation';

export const initRotationGizmoDraw = async (gl: Webgl, shader: Shader, asset: GltfAsset) => {
  const node = getNode(asset, MESH_NAME);
  ROTATE_GIZMO_OBJ = await loadMesh(gl, shader, asset, node.mesh, {
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

const drawRotateAxis = (frameEnv: FrameEnv, shader: Shader, opts: GizmoDrawOpts) => (axis: Axis) => {
  const {scene, glState} = frameEnv;
  const {gl} = glState;
  const {indexGlType, triangleCnt} = ROTATE_GIZMO_OBJ;

  const modelMatrix = getModelMatrix(glState, axis, opts);
  const mvp = glState.getMVP(modelMatrix, scene.camera);

  setUniforms(gl, shader, {
    'g_Color': AXIS_COLORS[axis],
    'g_MVP': mvp,
  }, true);
  gl.drawElements(gl.TRIANGLES, triangleCnt * 3, indexGlType, 0);
};

export const drawRotateGizmo = (frameEnv: FrameEnv, shader: Shader, opts: GizmoDrawOpts) => {
  const {gl} = frameEnv.glState;
  const {vao, indexBuffer} = ROTATE_GIZMO_OBJ;

  shader.use(gl);
  vao.bind(gl);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  const drawAxis = drawRotateAxis(frameEnv, shader, opts);
  AxisList.map(drawAxis);
  updateMarkers(frameEnv, opts);
};
