import {GlState} from './GlState';
import {MarkerPosition} from './structs';
import {calculateBoneMatrices} from './calculateBoneMatrices';
import {create as mat4_Create, identity} from 'gl-mat4';
import {fromValues as vec3_Create} from 'gl-vec3';
import {drawLamp} from './drawLamp';
import {getMarkerPositionsFromArmature, drawMarkers} from './drawMarkers';

const CAMERA_MOVE_SPEED = 0.005; // depends on scale etc.
const CAMERA_ROTATE_SPEED = 0.025 / 6;

const identityMatrix = (() => {
  const m = mat4_Create();
  return identity(m);
})();

const createMarkers = (positions: MarkerPosition[]) => {
  const armatureMarkers = positions.map(position => ({
    color: vec3_Create(0, 0, 1),
    position,
    renderable: true,
  }));

  const testMarker = {
    color: vec3_Create(0, 1, 0),
    position: [0.5, 0.5] as any,
    renderable: true,
  };

  return [...armatureMarkers, testMarker];
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
  const {gl, lampArmature, camera} = glState;

  const animState = createAnimState(time);

  // TODO handle clicks etc.
  camera.update(animState.deltaTime, CAMERA_MOVE_SPEED, CAMERA_ROTATE_SPEED);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const boneTransforms = calculateBoneMatrices(animState, lampArmature);
  drawLamp(animState, glState, boneTransforms, identityMatrix);

  const markerPositions = getMarkerPositionsFromArmature(glState, lampArmature, boneTransforms, identityMatrix);
  const markers = createMarkers(markerPositions);
  drawMarkers(glState, markers);
};
