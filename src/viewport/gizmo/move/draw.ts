import {vec3} from 'gl-vec3';
import {create as mat4_Create, fromXRotation, fromZRotation} from 'gl-mat4';
import {setUniforms, toRadians, Axis, AxisList, createModelMatrix} from 'gl-utils';
import {updateMarkers} from './updateMarkers';
import {AXIS_COLORS, GizmoDrawOpts} from '../index';
import {Scene} from 'viewport/scene';
import {FrameEnv} from 'viewport/main';


const ANGLE_90_DGR = toRadians(90);

const getRotationMatrix = (scene: Scene, axis: Axis, markerPos: vec3) => {
  const cameraPos = scene.camera.getPosition();
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

const getModelMatrix = (scene: Scene, axis: Axis, opts: GizmoDrawOpts) => {
  const {origin, size} = opts;
  const markerPos = origin.$_framePosition.position3d;
  const rotateAxisMat = getRotationMatrix(scene, axis, markerPos);
  return createModelMatrix(markerPos, rotateAxisMat, size);
};

const getMesh = (frameEnv: FrameEnv) => frameEnv.scene.gizmoMeta.moveMesh;
const getShader = (frameEnv: FrameEnv) => frameEnv.scene.gizmoMeta.shader;

const drawMoveArrow = (frameEnv: FrameEnv, opts: GizmoDrawOpts) => (axis: Axis) => {
  const {scene, glState: {gl}} = frameEnv;
  const {indexGlType, triangleCnt} = getMesh(frameEnv);

  const modelMatrix = getModelMatrix(scene, axis, opts);
  const mvp = scene.getMVP(modelMatrix);

  setUniforms(gl, getShader(frameEnv), {
    'g_Color': AXIS_COLORS[axis],
    'g_MVP': mvp,
  }, true);
  gl.drawElements(gl.TRIANGLES, triangleCnt * 3, indexGlType, 0);

  // marker:
  updateMarkers(frameEnv, mvp, modelMatrix, axis);
};

export const drawMoveGizmo = (frameEnv: FrameEnv, opts: GizmoDrawOpts) => {
  const {gl} = frameEnv.glState;
  const {vao, indexBuffer} = getMesh(frameEnv);

  getShader(frameEnv).use(gl);
  vao.bind(gl);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  const drawAxis = drawMoveArrow(frameEnv, opts);
  AxisList.forEach(drawAxis);
};
