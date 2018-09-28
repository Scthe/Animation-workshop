import {GlState} from './GlState';
import {drawObject3d} from './drawObject3d';
import {drawGizmo, GizmoType} from './gizmo';
import {drawMarkers} from './marker';
import {calculateBoneMatrices, updateArmatureMarkers} from './armature';
import {requestAnimFrame, handleResize} from 'gl-utils';
import {getSelectedObject} from '../UI_State';
import {Scene, createScene} from './scene';

// TODO verify if move gizmo is not clickable when rotate is selected

const CAMERA_MOVE_SPEED = 0.005; // depends on scale etc.
const CAMERA_ROTATE_SPEED = 0.025 / 6;

//////////
/// Anim state
//////////

/** Animation timing etc. */
export interface AnimState {
  deltaTime: number; // previous -> this frame
  // animationFrameId: number; // frame to render, used for interpolation etc.
  frameId: number; // id of current frame

  // fromAnimStartMs: number
  // fromAnimStartFrame: number
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



//////////
/// Per frame update
//////////

export interface FrameEnv {
  timing: AnimState;
  glState: GlState;
  scene: Scene;
}



const viewportUpdate = (time: number, glState: GlState, scene: Scene) => {
  const {gl, pressedKeys} = glState;
  const {camera, lamp} = scene;

  const frameEnv = { timing: createAnimState(time), glState, scene, };

  camera.update(frameEnv.timing.deltaTime, CAMERA_MOVE_SPEED, CAMERA_ROTATE_SPEED, pressedKeys);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  const [width, height] = glState.getViewport();
  gl.viewport(0.0, 0.0, width, height);

  calculateBoneMatrices(frameEnv.timing, lamp.bones);
  drawObject3d(frameEnv, scene.lamp);

  drawGizmo(frameEnv, {
    type: GizmoType.Rotate,
    // type: GizmoType.Move,
    size: 0.5,
    origin: getSelectedObject(),
  });

  // markers
  updateArmatureMarkers(frameEnv, lamp);
  drawMarkers(frameEnv.timing, glState);
};

//////////
/// Some init stuff
//////////

export const init = async (canvas: HTMLCanvasElement) => {
  const glState = new GlState();
  await glState.init(canvas);

  glState.gl.clearColor(0.5, 0.5, 0.5, 1.0);
  glState.gl.clearDepth(1.0);

  const scene = await createScene(glState);
  glState.mouseHander.scene = scene;

  const onDraw = (time: number) => {
    handleResize(glState.gl);
    viewportUpdate(time, glState, scene);
    requestAnimFrame(onDraw);
  };

  return onDraw;
};
