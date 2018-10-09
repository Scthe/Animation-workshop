import {vec2} from 'gl-vec2';
import {
  vec3, create as vec3_0, fromValues as vec3_Create,
  subtract, scale, dot, normalize
} from 'gl-vec3';
import {
  mat4, create as mat4_Create,
  fromXRotation, fromZRotation, multiply,
} from 'gl-mat4';
import {create as quat_Create, rotationTo} from 'gl-quat';

import {subtractNorm, Axis, toRadians, transformPointByMat4} from 'gl-utils';
import {
  generateRayFromCamera,
  createPlaneAroundAxisAndTowardCamera,
  planeRayIntersection,
  Plane,
  getPlane_d,
  getPointFromRay,
} from 'gl-utils/raycast';

import {addMove, addRotation} from '../../UI_Bridge';
import {FrameEnv} from 'viewport/main';
import {Bone} from 'viewport/armature';
import {Marker} from 'viewport/marker';
import {GizmoAxisDragEvent} from './index';


// NOTE: transform deltas are not cumulative: set, not add!

// TODO or maybe just unproject vec4(pxX, pxY, dist(camera, marker), 1) for view space points?
// TODO compare wrong mappings with blender


const generateRay = (frameEnv: FrameEnv, mousePosPx: vec2) => {
  const {glState, scene} = frameEnv;
  const [width, height] = glState.getViewport();

  const cameraDesc = {
    viewport: {width, height},
    viewProjMat: scene.getMVP(mat4_Create()),
  };

  return generateRayFromCamera(cameraDesc, mousePosPx);
};

const projectClickOntoPlane = (frameEnv: FrameEnv, plane: Plane, posPx: vec2) => {
  const ray = generateRay(frameEnv, posPx);
  return planeRayIntersection(plane, ray);
};

const projectOntoAxis = (vec: vec3, axis: vec3) => {
  return scale(vec3_0(), axis, dot(vec, axis)); // TODO handle 180dgr
};


////////////////////
// DEBUG
////////////////////

// const d2 = (a: number) => Number(a).toFixed(3);
// const to_str = (v: vec3) => `[${d2(v[0])}, ${d2(v[1])}, ${d2(v[2])}]`;

const fillWithDebugMarkers = (vpMat: mat4, markers: Marker[], axisDir: vec3, point: vec3) => {
  const SPACING = 0.2;
  const ray = {origin: point, dir: axisDir};

  markers.forEach((m: Marker, i: number) => {
    m.__$position3d = getPointFromRay(ray, (i - markers.length / 2) * SPACING);
  });
};


//////////////
/// Move
//////////////

const getMoveAxis = (frameEnv: FrameEnv, objPos: vec3,  axis: Axis) => {
  const gizmoMarker = frameEnv.scene.gizmoMeta.markers[axis];
  return subtractNorm(gizmoMarker.$position3d, objPos);
};

export const applyGizmoMove = (frameEnv: FrameEnv, ev: GizmoAxisDragEvent) => {
  const {mouseEvent, axis} = ev;
  const {selectedObject, scene: {camera}} = frameEnv;
  const objPosition = selectedObject.$position3d;

  // create plane to project clicked 3d points onto
  const axisVec = getMoveAxis(frameEnv, objPosition, axis);
  const plane = createPlaneAroundAxisAndTowardCamera(axisVec, objPosition, camera.getPosition());

  // do the projection
  const p0_onPlane   = projectClickOntoPlane(frameEnv, plane, mouseEvent.firstClick);
  const pNow_onPlane = projectClickOntoPlane(frameEnv, plane, mouseEvent.position);
  // both markers are somewhere on the plane, project onto axis to calc delta
  const p0   = projectOntoAxis(p0_onPlane, axisVec);
  const pNow = projectOntoAxis(pNow_onPlane, axisVec);

  // done!
  const delta = subtract(vec3_0(), pNow, p0);
  addMove(selectedObject.name, delta);

  // debug
  const vp = frameEnv.scene.getMVP(mat4_Create());
  const debug = frameEnv.scene.debugMarkers;
  fillWithDebugMarkers(vp, debug.axis, axisVec, objPosition);
  debug.dragStart.__$position3d = p0;
  debug.dragNowOnPlane.__$position3d = pNow_onPlane;
  debug.dragNow.__$position3d = pNow;
};

//////////////
/// Rotate
//////////////

/*
const toHumanAngle = (a: vec3, b: vec3) => {
  const dd = dot(a, b); // todo: handle negative angles, tho this is just debug print..
  const angleRad = Math.acos(dd);
  return angleRad * 180 / Math.PI;
};*/


////////////
// TODO use from gizmo/draw instead, but debug wrong axis with after translation first
const ANGLE_90_DGR = toRadians(90);

const getAxisMatrix = (axis: Axis) => {
  switch (axis) {
    case Axis.AxisX:
      return fromZRotation(mat4_Create(), ANGLE_90_DGR);
    case Axis.AxisY:
      return mat4_Create(); // identity
    case Axis.AxisZ:
      return fromXRotation(mat4_Create(), -ANGLE_90_DGR);
  }
};

const getRotationAxis = (selectedObject: Marker, axis: Axis) => {
  const axisRotationMatrix = getAxisMatrix(axis);

  const bone = selectedObject.owner as Bone;
  const boneMatrix = bone.getFrameMatrix();

  const m = multiply(mat4_Create(), boneMatrix, axisRotationMatrix);
  const v = vec3_Create(0, 1, 0);
  return normalize(vec3_0(), transformPointByMat4(vec3_0(), v, m, true));
};
////////////


export const applyGizmoRotate = (frameEnv: FrameEnv, ev: GizmoAxisDragEvent) => {
  const {mouseEvent, axis} = ev;
  const {selectedObject} = frameEnv;
  const objPosition = selectedObject.$position3d;
  // NOTE: rotation axis is same as move axis == plane normal

  // create plane to project clicked 3d points onto
  const axisVec = getRotationAxis(selectedObject, axis);
  const plane = {
    normal: axisVec,
    d: getPlane_d(axisVec, objPosition),
  };

  // do the projection
  const p0   = projectClickOntoPlane(frameEnv, plane, mouseEvent.firstClick);
  const pNow = projectClickOntoPlane(frameEnv, plane, mouseEvent.position);

  // calculate vectors: objectCenter->orgClick and objectCenter->nowClick
  const a = subtractNorm(p0, objPosition);
  const b = subtractNorm(pNow, objPosition);
  // console.log(`angle=${toHumanAngle(a, b)}`);

  // get quat between vectorOrg and vectorNow
  const qRotate = rotationTo(quat_Create(), a, b);
  addRotation(selectedObject.name, qRotate); // done!

  // debug
  const vp = frameEnv.scene.getMVP(mat4_Create());
  const debug = frameEnv.scene.debugMarkers;
  fillWithDebugMarkers(vp, debug.axis, axisVec, objPosition);
  debug.dragStart.__$position3d = p0;
  debug.dragNowOnPlane.__$position3d = pNow;
};
