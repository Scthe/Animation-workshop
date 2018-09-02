import {GlState} from './GlState';
import {create as mat4_Create, identity} from 'gl-mat4';
import {drawLamp} from './drawLamp';
import {drawGizmo, GizmoType} from './gizmo';
import {updateArmatureMarkers, drawMarkers} from './marker';
import {calculateBoneMatrices} from './Armature';
import {getSelectedObject} from '../UI_State';


const CAMERA_MOVE_SPEED = 0.005; // depends on scale etc.
const CAMERA_ROTATE_SPEED = 0.025 / 6;

const identityMatrix = (() => {
  const m = mat4_Create();
  return identity(m);
})();

/** Animation timing etc. */
export interface AnimState {
  deltaTime: number; // previous -> this frame
  // animationFrameId: number; // frame to render, used for interpolation etc.
  frameId: number; // id of current frame
}

const createAnimState = ((timeOld: number, frameId: number) => (time: number) => {
  const animState = {
    deltaTime: time - timeOld,
    frameId,
  };
  timeOld = time;
  ++frameId;

  return animState;
})(0, 0);

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
  updateArmatureMarkers(glState, lampArmature, boneTransforms, identityMatrix);
  drawMarkers(animState, glState);
};
