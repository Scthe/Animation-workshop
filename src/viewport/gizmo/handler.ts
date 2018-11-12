import {vec2} from 'gl-vec2';
import {
  vec3, create as vec3_0,
  subtract, scale, length, mul,
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

const getMarkerPositionWS = (frameEnv: FrameEnv, axis: Axis) => {
  const gizmoMarker = frameEnv.scene.gizmoMeta.markers[axis];
  return gizmoMarker.$position3d;
};

const getDirToMarkerForAxis = (frameEnv: FrameEnv, objPos: vec3,  axis: Axis) => {
  const gizmoPosition = getMarkerPositionWS(frameEnv, axis);
  return subtractNorm(gizmoPosition, objPos);
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

export const applyGizmoMove = (frameEnv: FrameEnv, ev: GizmoAxisDragEvent) => {
  const {mouseEvent, axis} = ev;
  const {selectedMarker, scene: {camera}} = frameEnv;
  const objPosition = selectedMarker.$position3d;
  const moveAxisLocalSpace = getAxisVector(axis);

  // create plane to project clicked 3d points onto
  const moveAxis = { // in world space
    origin: objPosition,
    dir: getDirToMarkerForAxis(frameEnv, objPosition, axis),
  } as Ray;
  const plane = createPlaneAroundAxisAndTowardCamera(moveAxis, camera.getPosition());

  // do the projection
  const p0_onPlane   = projectClickOntoPlane(frameEnv, plane, mouseEvent.firstClick);
  const pNow_onPlane = projectClickOntoPlane(frameEnv, plane, mouseEvent.position);
  // both markers are somewhere on the plane, project onto axis to calc delta
  const p0   = projectPointOntoRay(p0_onPlane, moveAxis);
  const pNow = projectPointOntoRay(pNow_onPlane, moveAxis);

  // finalize calcs (delta between projected points as delta position)
  const delta = subtract(vec3_0(), pNow, p0);
  const dir = getDirectionModifier(moveAxis, p0, pNow);
  const amountMoved = length(delta);
  const offset = scale(vec3_0(), moveAxisLocalSpace, amountMoved * dir);
  mul(offset, offset, GLTF_PLS.MOVE_BONE_AXIS_MODS); // blender exporter fixing
  addMove(selectedMarker.name, offset);

  // debug
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

const ROTATE_SENSITIVITY = 1 / 100;

export const applyGizmoRotate = (frameEnv: FrameEnv, ev: GizmoAxisDragEvent) => {
  // I don't have patience to deal with this ATM
  const {mouseEvent, axis} = ev;
  const {selectedMarker} = frameEnv;

  const axisVec = getAxisVector(axis);
  const d = mouseEvent.totalDelta[0] * ROTATE_SENSITIVITY;
  const q = setAxisAngle(quat_Create(), axisVec, d);
  addRotation(selectedMarker.name, q);
};
