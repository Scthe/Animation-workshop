import {requestAnimFrame, handleResize} from './gl-utils';
import {GlState} from './viewport/GlState';
import {doDraw} from './viewport/doDraw';

const CANVAS_EL_ID = 'anim-canvas';
const GLTF_URL = require('assets/LampAnimScene.glb');
const CAMERA_MOVE_SPEED = 0.005; // depends on scale etc.
const CAMERA_ROTATE_SPEED = 0.025 / 6;

const init = async () => {
  const glState = new GlState();
  await glState.init(CANVAS_EL_ID, GLTF_URL);

  glState.gl.clearColor(0.5, 0.5, 0.5, 0.9);
  glState.gl.clearDepth(1.0);

  let timeOld = 0;
  let frameId = 0;

  const onDraw = (time: number) => {
    const {gl, camera} = glState;
    handleResize(gl);

    const animState = {
      deltaTime: time - timeOld,
      frameId,
      animationFrameId: 0,
    };
    timeOld = time;
    ++frameId;

    camera.update(animState.deltaTime, CAMERA_MOVE_SPEED, CAMERA_ROTATE_SPEED);

    // draw
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    doDraw(animState, glState);

    // fin
    requestAnimFrame(onDraw);
  };

  return onDraw;
};

init()
  .then((onDraw: Function) => {
    onDraw(0);
  })
  .catch((e: any) => {
    console.error(`FATAL_ERROR:`, e);
  });
