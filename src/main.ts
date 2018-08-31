import {requestAnimFrame, handleResize} from './gl-utils';
import {GlState} from './viewport/GlState';
import {viewportUpdate} from './viewport/main';

const CANVAS_EL_ID = 'anim-canvas';
const GLTF_URL = require('assets/TestScene.glb');

const init = async () => {
  const glState = new GlState();
  await glState.init(CANVAS_EL_ID, GLTF_URL);

  glState.gl.clearColor(0.5, 0.5, 0.5, 0.9);
  glState.gl.clearDepth(1.0);

  const onDraw = (time: number) => {
    handleResize(glState.gl);
    viewportUpdate(time, glState);
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
