import {vec2} from 'gl-vec2';
import {
  vec3, create as vec3_0,
  subtract, scale, length
} from 'gl-vec3';
import {
  Ray,
  createPlaneAroundAxisAndTowardCamera,
  planeRayIntersection,
  Plane,
  projectPointOntoRay,
  getDirectionModifier,
} from 'gl-utils/raycast';

import {Scene} from 'viewport/scene';
import {Bone} from 'viewport/armature';
import {
  GizmoHandleDragEvent, Viewport,
  setMarkersAlongRay, generateViewportRay
} from './utils';
import {getWorldAxis, getLocalAxis} from 'viewport/gizmo/tfxSpace';


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

export const applyGizmoMove = (event: GizmoHandleDragEvent): vec3 => {
  const {mouseEvent, axis, selectedMarker, scene: {camera}, scene, viewport} = event;
  const objPosition = selectedMarker.$position3d;
  const bone = selectedMarker.owner as Bone;

  const moveAxisLocalSpace = getLocalAxis(bone, axis);

  // create plane to project clicked 3d points onto
  const moveAxisWorldSpace = { // in world space
    origin: objPosition,
    dir: getWorldAxis(bone, axis),
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

  // debug
  const vp = scene.getVP();
  setMarkersAlongRay(vp, scene.debugMarkers.axis, moveAxisWorldSpace);
  scene.debugMarkers.dragStart.$position3d = p0;
  scene.debugMarkers.dragNowOnPlane.$position3d = pNow_onPlane;
  scene.debugMarkers.dragNow.$position3d = pNow;

  //
  return offset;
};
