import {vec2, length as vec2_dist} from 'gl-vec2';
import {
  vec3, create as vec3_0,
  subtract, scale, length, mul
} from 'gl-vec3';
import {mat4, create as mat4_Create} from 'gl-mat4';
import {create as quat_Create, setAxisAngle} from 'gl-quat';

import {subtractNorm, Axis, getAxisVector} from 'gl-utils';
import {
  Ray,
  generateRayFromCamera,
  createPlaneAroundAxisAndTowardCamera,
  planeRayIntersection,
  Plane,
  getPointFromRay,
  projectPointOntoRay,
  getDirectionModifier,
} from 'gl-utils/raycast';

import {addMove, addRotation} from '../../UI_Bridge';
import {FrameEnv} from 'viewport/main';
import {Marker} from 'viewport/marker';
import {GizmoAxisDragEvent} from './index';

import * as GLTF_PLS from 'viewport/gltfExporterFixes';


// NOTE: transform deltas are not cumulative: set, not add!

const generateViewportRay = (frameEnv: FrameEnv, mousePosPx: vec2) => {
  const {glState, scene} = frameEnv;
  const [width, height] = glState.getViewport();

  const cameraDesc = {
    viewport: {width, height},
    viewProjMat: scene.getMVP(mat4_Create()),
  };

  return generateRayFromCamera(cameraDesc, mousePosPx);
};

const projectClickOntoPlane = (frameEnv: FrameEnv, plane: Plane, posPx: vec2) => {
  const ray = generateViewportRay(frameEnv, posPx);
  return planeRayIntersection(plane, ray);
};


////////////////////
// DEBUG
////////////////////

const fillWithDebugMarkers = (vpMat: mat4, markers: Marker[], axisDir: vec3, point: vec3) => {
  const SPACING = 0.2;
  const ray = {origin: point, dir: axisDir};

  markers.forEach((m: Marker, i: number) => {
    m.__$position3d = getPointFromRay(ray, (i - markers.length / 2) * SPACING);
  });
};

// const d2 = (a: number) => Number(a).toFixed(3);
// const to_str = (v: vec3) => `[${d2(v[0])}, ${d2(v[1])}, ${d2(v[2])}]`;

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
  const moveAxis = {
    origin: objPosition,
    dir: getMoveAxis(frameEnv, objPosition, axis), // in world space
  } as Ray;
  const plane = createPlaneAroundAxisAndTowardCamera(moveAxis, camera.getPosition());

  // do the projection
  const p0_onPlane   = projectClickOntoPlane(frameEnv, plane, mouseEvent.firstClick);
  const pNow_onPlane = projectClickOntoPlane(frameEnv, plane, mouseEvent.position);
  // both markers are somewhere on the plane, project onto axis to calc delta
  const p0   = projectPointOntoRay(p0_onPlane, moveAxis);
  const pNow = projectPointOntoRay(pNow_onPlane, moveAxis);

  // done!
  const delta = subtract(vec3_0(), pNow, p0);
  const dir = getDirectionModifier(moveAxis, p0, pNow);
  const d = length(delta);
  const axisVec = getAxisVector(axis);
  const offset = scale(vec3_0(), axisVec, d * dir);
  mul(offset, offset, GLTF_PLS.MOVE_BONE_AXIS_MODS);
  addMove(selectedObject.name, offset);

  // debug
  /*
  const dist = dot(pNow_onPlane, moveAxis.dir);
  const offset2 = scale(vec3_0(), moveAxis.dir, dist);

  console.log([
    `origin ${to_str(objPosition)}`,
    `axisDir ${to_str(moveAxis.dir)}`,
    `p0 ${to_str(p0)}`,
    `pNow ${to_str(pNow)}`,
    `pDelta ${to_str(subtractNorm(pNow, p0))}`,
    // `pNow_onPlane ${to_str(pNow_onPlane)}`,
    // `projectOntoRay (dist=${d2(dist)}, offset2=${to_str(offset2)})`
    // `plane (n=${to_str(plane.normal)}, d=${d2(plane.d)})`,
    `dir ${dir}`,
    `moveAmount ${to_str(offset)}`,
  ].join(', '));
  */

  const vp = frameEnv.scene.getMVP(mat4_Create());
  const debug = frameEnv.scene.debugMarkers;
  fillWithDebugMarkers(vp, debug.axis, moveAxis.dir, objPosition);
  debug.dragStart.__$position3d = p0;
  debug.dragNowOnPlane.__$position3d = pNow_onPlane;
  debug.dragNow.__$position3d = pNow;
};

//////////////
/// Rotate
//////////////


export const applyGizmoRotate = (frameEnv: FrameEnv, ev: GizmoAxisDragEvent) => {
  const {mouseEvent, axis} = ev;
  const {selectedObject} = frameEnv;

  // TODO do same as move: create plane

  const axisVec = getAxisVector(axis);
  let d = vec2_dist(mouseEvent.totalDelta) / 100;
  // TODO this fails when delta.y is big (since d is also big in that cause and sign change causes snap)
  d = mouseEvent.totalDelta[0] < 0 ? -d : d;
  const q = setAxisAngle(quat_Create(), axisVec, d);
  addRotation(selectedObject.name, q); // done!
};
