import {GlState} from './GlState';
import {create as mat4_Create, identity} from 'gl-mat4';
import {fromValues as vec3_Create} from 'gl-vec3';
import {drawLamp} from './drawLamp';
import {drawGizmo, GizmoType} from './drawGizmos';
import {getMarkersFromArmature, drawMarkers} from './drawMarkers';
import {calculateBoneMatrices} from './calculateBoneMatrices';
import {getSelectedObject} from '../UI_State';
import {Marker} from './structs';


const CAMERA_MOVE_SPEED = 0.005; // depends on scale etc.
const CAMERA_ROTATE_SPEED = 0.025 / 6;

const identityMatrix = (() => {
  const m = mat4_Create();
  return identity(m);
})();

const TEST_MARKER = {
  name: `Test`,
  radius: 0,
  color: [1.0, 0.5, 1.0] as any,
  position3d: [0, 0, 0] as any,
  positionNDC: [0.5, 0.5] as any,
  renderable: true,
};

const updateMarkerCache = (glState: GlState, newMarkers: Marker[]) => {
  const oldMarkers = glState.lastFrameCache.markers;
  const getOldMarker = (name: string) => oldMarkers.filter(m => m.name === name)[0];

  newMarkers.forEach(marker => {
    const oldMarker = getOldMarker(marker.name);
    if (!oldMarker) {
      oldMarkers.push(marker);
    } else {
      oldMarker.position3d = marker.position3d;
      oldMarker.positionNDC = marker.positionNDC;
    }
  });

  return oldMarkers;
};

let timeOld = 0;
let frameId = 0;
const createAnimState = (time: number) => {
  const animState = {
    deltaTime: time - timeOld,
    frameId,
  };
  timeOld = time;
  ++frameId;

  return animState;
};

export const viewportUpdate = (time: number, glState: GlState) => {
  const {gl, lampArmature, camera, pressedKeys} = glState;

  const animState = createAnimState(time);

  camera.update(animState.deltaTime, CAMERA_MOVE_SPEED, CAMERA_ROTATE_SPEED, pressedKeys);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  const {width, height} = glState.getViewport();
  gl.viewport(0.0, 0.0, width, height);

  const boneTransforms = calculateBoneMatrices(animState, lampArmature);
  drawLamp(animState, glState, boneTransforms, identityMatrix);

  drawGizmo(glState, {
    type: GizmoType.Move,
    size: 0.6,
    origin: getSelectedObject(),
  });

  // markers
  const armatureMarkers = getMarkersFromArmature(glState, lampArmature, boneTransforms, identityMatrix);
  const markers = updateMarkerCache(glState, [
    ...armatureMarkers,
    {...TEST_MARKER}
  ]);
  drawMarkers(animState, glState, markers);

  // cache
};
