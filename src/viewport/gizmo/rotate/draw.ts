import {create as mat4_Create, identity, fromXRotation, fromZRotation} from 'gl-mat4';
import {setUniforms, toRadians, Axis, AxisList, createModelMatrix} from 'gl-utils';
import {GlState} from 'viewport/GlState';
import {FrameEnv} from 'viewport/main';
import {AXIS_COLORS, GizmoDrawOpts} from '../index';
import {updateMarkers} from './updateMarkers';


// TODO make this draw as true local rotation it is, just premultiply getRotationMatrix's result (or bone.frameMatrix * AxisMatrix)
// TODO rotate gizmo should have triangle/quad cross-cut

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
  const markerPos = origin.$_framePosition.position3d;
  return createModelMatrix(markerPos, getRotationMatrix(axis), size);
};

const getMesh = (frameEnv: FrameEnv) => frameEnv.scene.gizmoMeta.rotateMesh;
const getShader = (frameEnv: FrameEnv) => frameEnv.scene.gizmoMeta.shader;

const drawRotateAxis = (frameEnv: FrameEnv, opts: GizmoDrawOpts) => (axis: Axis) => {
  const {scene, glState: {gl}} = frameEnv;
  const {indexGlType, triangleCnt} = getMesh(frameEnv);

  const modelMatrix = getModelMatrix(frameEnv.glState, axis, opts);
  const mvp = scene.getMVP(modelMatrix);

  setUniforms(gl, getShader(frameEnv), {
    'g_Color': AXIS_COLORS[axis],
    'g_MVP': mvp,
  }, true);
  gl.drawElements(gl.TRIANGLES, triangleCnt * 3, indexGlType, 0);
};

export const drawRotateGizmo = (frameEnv: FrameEnv, opts: GizmoDrawOpts) => {
  const {glState: {gl}, scene} = frameEnv;
  const {vao, indexBuffer} = getMesh(frameEnv);

  getShader(frameEnv).use(gl);
  vao.bind(gl);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  const drawAxis = drawRotateAxis(frameEnv, opts);
  AxisList.map(drawAxis);
  updateMarkers(scene, opts);
};
