import {GlState} from './GlState';
import {MarkerPosition, AnimState} from './structs';
import {calculateBoneMatrices} from './calculateBoneMatrices';
import {create as mat4_Create, identity} from 'gl-mat4';
import {fromValues as vec3_Create} from 'gl-vec3';
import {drawLamp} from './drawLamp';
import {drawGizmo, GizmoType} from './drawGizmos';
import {getMarkerPositionsFromArmature, drawMarkers} from './drawMarkers';
import {getSelectedObject} from '../UI_State';
import {lerp, hexToVec3} from '../gl-utils';


const CAMERA_MOVE_SPEED = 0.005; // depends on scale etc.
const CAMERA_ROTATE_SPEED = 0.025 / 6;

const identityMatrix = (() => {
  const m = mat4_Create();
  return identity(m);
})();

const MARKER_RADIUS = 12;
const MARKER_PULSE_INCREASE = 1.2;
const MARKER_PULSE_TIME = 30;

const createMarkers = (animState: AnimState, positions: MarkerPosition[]) => {
  const armatureMarkers = positions.map((position, idx) => ({
    name: `Bone${idx}`,
    radius: MARKER_RADIUS,
    color: hexToVec3(0xca38cd),
    position,
    renderable: true,
  }));

  const testMarker = {
    name: `Test`,
    radius: MARKER_RADIUS,
    color: hexToVec3(0x59f65f),
    position: [0.5, 0.5] as any,
    renderable: true,
  };

  const markers = [...armatureMarkers, testMarker];

  // TODO move to drawMarkers, but after UI is done. Maybe isActive flag?
  const selectedObj = getSelectedObject();
  const selectedMarkerName = selectedObj ? selectedObj.name : undefined;
  let pulseTiming = animState.frameId % (2 * MARKER_PULSE_TIME);
  pulseTiming = pulseTiming < MARKER_PULSE_TIME
    ? pulseTiming
    : MARKER_PULSE_TIME - (pulseTiming % MARKER_PULSE_TIME);
  pulseTiming = pulseTiming / MARKER_PULSE_TIME;
  const pulseSize = MARKER_RADIUS * lerp(1, MARKER_PULSE_INCREASE, pulseTiming);

  return markers.map(m => {
    return m.name !== selectedMarkerName ? m : ({
      ...m,
      radius: pulseSize,
    });
  });
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
    origin: vec3_Create(0, 1, 0),
  });

  const markerPositions = getMarkerPositionsFromArmature(glState, lampArmature, boneTransforms, identityMatrix);
  const markers = createMarkers(animState, markerPositions);
  drawMarkers(glState, markers);

  // cache
  glState.lastFrameCache.markers = markers;
};
