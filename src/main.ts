import {requestAnimFrame, handleResize} from './gl-utils';
import {createGlState, GlState, ObjectGeometry} from './viewport/GlState';
import {doDraw} from './viewport/doDraw';

const CANVAS_EL_ID = 'anim-canvas';
const GLTF_URL = require('assets/LampAnimScene.glb');
const CAMERA_MOVE_SPEED = 0.02; // depends on scale etc.
const CAMERA_ROTATE_SPEED = 0.025 / 6;

const init = async () => {
  const glState = await createGlState(CANVAS_EL_ID, GLTF_URL);

  let timeOld = 0;

  const onDraw = (time: number) => {
    const {gl, camera} = glState;
    handleResize(gl);

    const animState = {
      deltaTime: time - timeOld,
      animationFrameId: 0,
    };
    timeOld = time;

    camera.update(animState.deltaTime, CAMERA_MOVE_SPEED, CAMERA_ROTATE_SPEED);

    doDraw(animState, glState);

    // fin
    requestAnimFrame(onDraw);
  };

  return onDraw;
};

init()
  .then((onDraw: Function) => {
    onDraw(0);
  });
