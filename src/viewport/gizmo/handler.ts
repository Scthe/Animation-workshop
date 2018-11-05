import {vec2, length as vec2_dist} from 'gl-vec2';
import {vec3, create as vec3_0, subtract, scale, dot, length} from 'gl-vec3';
import {mat4, create as mat4_Create} from 'gl-mat4';
import {create as quat_Create, setAxisAngle} from 'gl-quat';

import {subtractNorm, Axis, getAxisVector} from 'gl-utils';
import {
  generateRayFromCamera,
  createPlaneAroundAxisAndTowardCamera,
  planeRayIntersection,
  Plane,
  getPointFromRay,
} from 'gl-utils/raycast';

import {addMove, addRotation} from '../../UI_Bridge';
import {FrameEnv} from 'viewport/main';
import {Marker} from 'viewport/marker';
import {GizmoAxisDragEvent} from './index';


// NOTE: transform deltas are not cumulative: set, not add!


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
  const p0   = projectOntoAxis(p0_onPlane, axisVec); // TODO bug here!
  const pNow = projectOntoAxis(pNow_onPlane, axisVec);

  // done!
  const delta = subtract(vec3_0(), pNow, p0);
  const d = length(delta); // TODO multiply by (1 or -1)
  const axisVec_010 = getAxisVector(axis);
  addMove(selectedObject.name, scale(vec3_0(), axisVec_010, d));

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


export const applyGizmoRotate = (frameEnv: FrameEnv, ev: GizmoAxisDragEvent) => {
  const {mouseEvent, axis} = ev;
  const {selectedObject} = frameEnv;

  const axisVec = getAxisVector(axis);
  let d = vec2_dist(mouseEvent.totalDelta) / 100;
  // TODO this fails when delta.y is big (since d is also big in that cause and sign change causes snap)
  d = mouseEvent.totalDelta[0] < 0 ? -d : d;
  const q = setAxisAngle(quat_Create(), axisVec, d);
  addRotation(selectedObject.name, q); // done!
};
