import {GltfAsset} from 'gltf-loader-ts';
import {vec3, fromValues as vec3_Create, scale, normalize} from 'gl-vec3';
import {
  mat4, create as mat4_Create,
  fromTranslation, fromXRotation, fromZRotation, fromScaling,
  multiply, identity
} from 'gl-mat4';
import {Shader, setUniforms, toRadians} from '../../gl-utils';
import {GlState, ObjectGeometry} from '../GlState';
import {readObject} from '../readGltfObject';
import {Marker, createMarkerPosition, MarkerType} from '../marker';
import {GizmoAxis, GizmoAxisList, AXIS_COLORS, GizmoDrawOpts} from './index';

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

const getRotationMatrix = (axis: GizmoAxis) => {
  const rotateAxisMat = mat4_Create();

  switch (axis) {
    case GizmoAxis.AxisX:
      return fromZRotation(rotateAxisMat, ANGLE_90_DGR);
    case GizmoAxis.AxisY:
      return identity(rotateAxisMat);
    case GizmoAxis.AxisZ:
      return fromXRotation(rotateAxisMat, ANGLE_90_DGR);
  }
};

const getModelMatrix = (glState: GlState, axis: GizmoAxis, opts: GizmoDrawOpts) => {
  const markerPos = opts.origin.position.position3d;
  const rotateAxisMat = getRotationMatrix(axis);

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

const drawRotateAxis = (glState: GlState, shader: Shader, opts: GizmoDrawOpts) => (axis: GizmoAxis) => {
  const {gl} = glState;
  const {indicesGlType, triangleCnt} = ROTATE_GIZMO_OBJ;

  const modelMatrix = getModelMatrix(glState, axis, opts);
  const mvp = glState.getMVP(modelMatrix);

  setUniforms(gl, shader, {
    'g_Color': AXIS_COLORS[axis],
    'g_MVP': mvp,
  }, true);
  gl.drawElements(gl.TRIANGLES, triangleCnt * 3, indicesGlType, 0);

  return { mvp, modelMatrix };
  // marker:
  // updateMoveGizmoMarker(glState, mvp, modelMatrix, axis);
};


///////////// TODO move to separate file in markers/gizmo

// verify with getRotationMatrix
const MARKER_VECTOR_BY_AXIS = [
  // [1, 0, 1], // X
  // [1, 1, 0], // Y
  // [1, 1, 0], // Z
  [0, 1, 1], // X
  [1, 0, 1], // Y
  [1, 1, 0], // Z
];

/*
const getMarkerVectors = (glState: GlState, origin: Marker, size: number, axis: GizmoAxis) => {
  const cameraPos = glState.camera.getPosition();
  const markerPos = origin.position.position3d;
  const delta = [
    markerPos[0] - cameraPos[0],
    markerPos[1] - cameraPos[1],
    markerPos[2] - cameraPos[2]
  ];

  // const markerPos = opts.origin.position.position3d;
  // const rotateAxisMat = getRotationMatrix(axis);
  // const moveMat = mat4_Create();
  // fromTranslation(moveMat, markerPos);
  const axisPoints = MARKER_VECTOR_BY_AXIS[axis];
  // const vec = axisPoints as any;

  return scale(vec, normalize(vec, vec), size);
};
*/

// const updateMarkers = (glState: GlState, opts: GizmoDrawOpts, mvps: mat4[], modelMatrices: mat4[]) => {
const updateMarkers = (glState: GlState, opts: GizmoDrawOpts, matrices: any[]) => {
  const {origin, size} = opts;

  GizmoAxisList.forEach(axis => {
    // const {mvp, modelMatrix} = matrices[axis];
    // const modelMatrix = getModelMatrix(glState, axis, opts);
    const markerPos2 = opts.origin.position.position3d;
    const moveMat = mat4_Create();
    fromTranslation(moveMat, markerPos2);
    const scaleMat = mat4_Create();
    fromScaling(scaleMat, vec3_Create(opts.size, opts.size, opts.size));
    const modelMatrix = mat4_Create();
    multiply(modelMatrix, moveMat, scaleMat);
    const mvp = glState.getMVP(modelMatrix);

    // const markerVec = getMarkerVectors(glState, origin, size, axis);
    const markerVec = MARKER_VECTOR_BY_AXIS[axis] as any;

    // update position
    const markerName = GizmoAxis[axis];
    const markerPos = createMarkerPosition(mvp, modelMatrix, markerVec);
    glState.updateMarker(markerName, MarkerType.GizmoRotate, markerPos);

    // set radius based on view
    // const marker = glState.getMarker(markerName, MarkerType.GizmoMove);
    // marker.radius = getMoveGizmoMarkerRadius(glState, mvp, marker);
    // marker.radius = 20;
  });
};

///////////// TODO move to separate file in markers/gizmo


export const drawRotateGizmo = (glState: GlState, shader: Shader, opts: GizmoDrawOpts) => {
  const {gl} = glState;
  const {vao, indexBuffer} = ROTATE_GIZMO_OBJ;

  shader.use(gl);
  vao.bind(gl);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  const drawAxis = drawRotateAxis(glState, shader, opts);
  const matrices = GizmoAxisList.map(drawAxis);

  updateMarkers(glState, opts, matrices);
};
