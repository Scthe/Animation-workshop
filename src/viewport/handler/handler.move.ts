import {vec2} from 'gl-vec2';
import {
  vec3, create as vec3_0,
  subtract, scale, length, mul,
} from 'gl-vec3';
import {create as mat4_Create} from 'gl-mat4';

import {getAxisVector} from 'gl-utils';
import {
  Ray,
  createPlaneAroundAxisAndTowardCamera,
  planeRayIntersection,
  Plane,
  projectPointOntoRay,
  getDirectionModifier,
} from 'gl-utils/raycast';

import {addMove} from '../../UI_Bridge';
import {Scene} from 'viewport/scene';
import {
  GizmoHandleDragEvent, Viewport,
  setMarkersAlongRay, getDirToMarkerForAxis, generateViewportRay
} from './utils';

import * as GLTF_PLS from 'viewport/gltfExporterFixes';


const projectClickOntoPlane = (scene: Scene, viewport: Viewport, plane: Plane, posPx: vec2) => {
  const ray = generateViewportRay(scene, viewport, posPx);
  return planeRayIntersection(plane, ray);
};

const calculateMoveOffset = (moveAxisWorldSpace: Ray, firstClick: vec3, mouseNow: vec3) => {
  // delta between projected points is same as delta object position
  const delta = subtract(vec3_0(), mouseNow, firstClick);
  const amountMoved = length(delta);

  const dir = getDirectionModifier(moveAxisWorldSpace, firstClick, mouseNow);
  return amountMoved * dir;
};

export const applyGizmoMove = (event: GizmoHandleDragEvent) => {
  const {mouseEvent, axis, selectedMarker, scene: {camera}, scene, viewport} = event;
  const objPosition = selectedMarker.$position3d;
  const moveAxisLocalSpace = getAxisVector(axis);

  // create plane to project clicked 3d points onto
  const moveAxisWorldSpace = { // in world space
    origin: objPosition,
    dir: getDirToMarkerForAxis(scene, objPosition, axis),
  } as Ray;
  const plane = createPlaneAroundAxisAndTowardCamera(moveAxisWorldSpace, camera.getPosition());

  // do the projection
  const p0_onPlane   = projectClickOntoPlane(scene, viewport, plane, mouseEvent.firstClick);
  const pNow_onPlane = projectClickOntoPlane(scene, viewport, plane, mouseEvent.position);
  // both markers are somewhere on the plane, project onto axis to calc delta
  const p0   = projectPointOntoRay(p0_onPlane, moveAxisWorldSpace);
  const pNow = projectPointOntoRay(pNow_onPlane, moveAxisWorldSpace);

  // finalize calcs
  const moveOffset = calculateMoveOffset(moveAxisWorldSpace, p0, pNow);
  const offset = scale(vec3_0(), moveAxisLocalSpace, moveOffset);
  mul(offset, offset, GLTF_PLS.MOVE_BONE_AXIS_MODS); // blender exporter fixing
  addMove(selectedMarker.name, offset);

  // debug
  const vp = scene.getMVP(mat4_Create());
  setMarkersAlongRay(vp, scene.debugMarkers.axis, moveAxisWorldSpace);
  scene.debugMarkers.dragStart.__$position3d = p0;
  scene.debugMarkers.dragNowOnPlane.__$position3d = pNow_onPlane;
  scene.debugMarkers.dragNow.__$position3d = pNow;
};
