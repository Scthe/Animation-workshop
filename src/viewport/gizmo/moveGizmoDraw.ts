import {GltfAsset} from 'gltf-loader-ts';
import {vec3, fromValues as vec3_Create} from 'gl-vec3';
import {
  create as mat4_Create,
  fromTranslation, fromXRotation, fromZRotation, fromScaling,
  multiply
} from 'gl-mat4';
import {Shader, setUniforms, toRadians} from '../../gl-utils';
import {GlState, ObjectGeometry} from '../GlState';
import {readObject} from '../readGltfObject';
import {updateMoveGizmoMarker} from '../marker';
import {GizmoAxis, GizmoAxisList, AXIS_COLORS, GizmoDrawOpts} from './index';


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

const getRotationMatrix = (glState: GlState, axis: GizmoAxis, markerPos: vec3) => {
  const cameraPos = glState.camera.getPosition();
  const delta = [
    markerPos[0] - cameraPos[0],
    markerPos[1] - cameraPos[1],
    markerPos[2] - cameraPos[2]
  ];
  const rotateAxisMat = mat4_Create();
  let isNegative: number; // fun thing, no one said that {True, False} has to be boolean

  switch (axis) {
    case GizmoAxis.AxisX:
      isNegative = delta[0] >= 0 ? 1 : -1;
      return fromZRotation(rotateAxisMat, ANGLE_90_DGR * isNegative);
    case GizmoAxis.AxisY:
      isNegative = delta[1] >= 0 ? 2 : 0;
      return fromXRotation(rotateAxisMat, ANGLE_90_DGR * isNegative);
    case GizmoAxis.AxisZ:
      isNegative = delta[2] > 0 ? -1 : 1;
      return fromXRotation(rotateAxisMat, ANGLE_90_DGR * isNegative);
  }
};

const getModelMatrix = (glState: GlState, axis: GizmoAxis, opts: GizmoDrawOpts) => {
  const markerPos = opts.origin.position.position3d;
  const rotateAxisMat = getRotationMatrix(glState, axis, markerPos);

  const moveMat = mat4_Create();
  fromTranslation(moveMat, markerPos);

  const scaleMat = mat4_Create();
  fromScaling(scaleMat, vec3_Create(opts.size, opts.size, opts.size));

  const tmp = mat4_Create();
  const result = mat4_Create();
  multiply(tmp, moveMat, rotateAxisMat);
  multiply(result, tmp, scaleMat);

  return result;
};

const drawMoveArrow = (glState: GlState, shader: Shader, opts: GizmoDrawOpts) => (axis: GizmoAxis) => {
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
  updateMoveGizmoMarker(glState, mvp, modelMatrix, axis);
};

export const drawMoveGizmo = (glState: GlState, shader: Shader, opts: GizmoDrawOpts) => {
  const {gl} = glState;
  const {vao, indexBuffer} = MOVE_GIZMO_OBJ;

  shader.use(gl);
  vao.bind(gl);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  const drawAxis = drawMoveArrow(glState, shader, opts);
  GizmoAxisList.forEach(drawAxis);
};
