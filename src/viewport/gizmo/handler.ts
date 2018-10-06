import {vec2} from 'gl-vec2';
import {
  create as vec3_0, fromValues as vec3_Create,
  subtract, multiply
} from 'gl-vec3';
import {create as mat4_Create} from 'gl-mat4';
import {create as quat_Create, rotationTo} from 'gl-quat';
import {subtractNorm} from 'gl-utils';
import {
  generateRayFromCamera,
  createPlaneAroundAxisAndTowardCamera,
  planeRayIntersection,
  Plane
} from 'gl-utils/raycast';
import {addMove, addRotation} from '../../UI_Bridge';
import {FrameEnv} from 'viewport/main';
import {GizmoAxisDragEvent} from './index';

// TODO or maybe just unproject vec4(pxX, pxY, dist(camera, marker), 1) for view space points?
// TODO glState.tmpKeyframe too? and whole keyframe system

// const d2 = (a: number) => Number(a).toFixed(3);
// const to_str = (v: vec3) => `[${d2(v[0])}, ${d2(v[1])}, ${d2(v[2])}]`;

const generateRay = (frameEnv: FrameEnv, mousePosPx: vec2) => {
  const {glState, scene} = frameEnv;
  const [width, height] = glState.getViewport();

  const cameraDesc = {
    viewport: {width, height},
    viewProjMat: scene.getMVP(mat4_Create()),
  };

  return generateRayFromCamera(cameraDesc, mousePosPx);
};

const projectPixelsOntoPlane = (frameEnv: FrameEnv, plane: Plane, clickStartPx: vec2, clickNowPx: vec2) => {
  const ray0   = generateRay(frameEnv, clickStartPx);
  const rayNow = generateRay(frameEnv, clickNowPx);
  const p0   = planeRayIntersection(plane, ray0);
  const pNow = planeRayIntersection(plane, rayNow);
  return {p0, pNow};
};

//////////////
/// Move
//////////////

export const applyGizmoMove = (frameEnv: FrameEnv, ev: GizmoAxisDragEvent) => {
  const {mouseEvent} = ev;

  // create plane to project clicked 3d points onto
  const {selectedObject} = frameEnv;
  const camera = frameEnv.scene.camera;
  const objPosition = selectedObject.$_framePosition.position3d;
  const axisVec = vec3_Create(1, 0, 0); // axis X
  const plane = createPlaneAroundAxisAndTowardCamera(axisVec, objPosition, camera.getPosition());

  const {p0, pNow} = projectPixelsOntoPlane(frameEnv, plane, mouseEvent.firstClick, mouseEvent.position);

  // NOTE: move is not cumulative! set, not add!
  const delta = subtract(vec3_0(), pNow, p0);
  const dist = multiply(vec3_0(), axisVec, delta);
  addMove(selectedObject.name, dist);
};

//////////////
/// Rotate
//////////////

export const applyGizmoRotate = (frameEnv: FrameEnv, ev: GizmoAxisDragEvent) => {
  const {mouseEvent} = ev;

  // create plane to project clicked 3d poits onto
  const {selectedObject} = frameEnv;
  // const camera = frameEnv.scene.camera;
  const objPosition = selectedObject.$_framePosition.position3d;
  // const axisVec = vec3_Create(1, 0, 0); // axis X
  // const plane = createPlaneAroundAxisAndTowardCamera(axisVec, objPosition, camera.getPosition());
  const plane = {
    normal: vec3_Create(0, 0, -1),
    d: 0,
  };

  const {p0, pNow} = projectPixelsOntoPlane(frameEnv, plane, mouseEvent.firstClick, mouseEvent.position);

  const a = subtractNorm(p0, objPosition);
  const b = subtractNorm(pNow, objPosition);
  // const dd = dot(a, b); // TODO handle negative angles, tho this is just print only..
  // const angleRad = Math.acos(dd);
  // console.log(`angle=${angleRad * 180 / Math.PI}, dot=${dd}, angleRad=${angleRad}`);

  // NOTE: rotate is not cumulative! set, not add!
  const qRotate = rotationTo(quat_Create(), a, b);
  addRotation(selectedObject.name, qRotate);
};
