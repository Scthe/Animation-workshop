import {vec2} from 'gl-vec2';
import {mat4} from 'gl-mat4';

import {Axis} from 'gl-utils';
import {
  Ray,
  generateRayFromCamera,
  getPointFromRay,
} from 'gl-utils/raycast';

import {Scene} from 'viewport/scene';
import {Marker} from 'viewport/marker';
import {MouseDragEvent} from './MouseHandler';


////////////
// GENERAL UTILS

export const setCursor = (cursor: string) =>
  document.body.style.cursor = cursor;

export interface Viewport {
  width: number;
  height: number;
}

export interface GizmoHandleDragEvent {
  mouseEvent: MouseDragEvent;
  axis: Axis;
  selectedMarker: Marker;
  scene: Scene;
  viewport: Viewport;
}


////////////
// RAY UTILS

export const generateViewportRay = (scene: Scene, viewport: Viewport, mousePosPx: vec2) => {
  const cameraDesc = {
    viewport,
    viewProjMat: scene.getVP(),
  };

  return generateRayFromCamera(cameraDesc, mousePosPx);
};


////////////
// DEBUG

const DEBUG_RAY_SPACING = 0.2;

export const setMarkersAlongRay = (vpMat: mat4, markers: Marker[], ray: Ray) => {
  markers.forEach((m: Marker, i: number) => {
    const rayOffset = i * DEBUG_RAY_SPACING;
    m.$position3d = getPointFromRay(ray, rayOffset);
  });
};
