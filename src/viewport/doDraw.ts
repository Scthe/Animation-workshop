import {GlState} from './GlState';
import {setUniforms} from '../gl-utils';

interface AnimState {
  deltaTime: number; // previous -> this frame
  animationFrameId: number; // frame to render, used for interpolation etc.
}

const identityMatrix = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1];

const drawLamp = (animState: AnimState, glState: GlState) => {
  const {gl, canvas, camera, lampShader: shader, lampObject: geo} = glState;
  if (!geo) { return; }

  shader.use(gl);

  // TODO use DrawParameters
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clearColor(0.5, 0.5, 0.5, 0.9);
  gl.clearDepth(1.0);
  gl.viewport(0.0, 0.0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  setUniforms(gl, shader, {
    'g_Pmatrix': camera.getProjectionMatrix(canvas.width, canvas.height),
    'g_Vmatrix': camera.getViewMatrix(),
    'g_Mmatrix': identityMatrix,
  }, true);

  /*
  const nBones = 10;
  const tra = getBoneTransforms(0.0, nBones);
  tra.forEach((mat: mat4, i: number) => {
    const name = `g_BoneTransforms[${i}]`;
    const location = gl.getUniformLocation(shader.glId, name);
    gl.uniformMatrix4fv(location, false, mat);
  });
  */


  const {vao, indexBuffer, triangleCnt} = geo;
  // TODO bind Vao too
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.drawElements(gl.TRIANGLES, triangleCnt * 3, gl.UNSIGNED_SHORT, 0);
};

export const doDraw = (animState: AnimState, scene: GlState) => {
  drawLamp(animState, scene);
  // drawBall(animState, scene);
  // drawManipulators(animState, scene);
};
