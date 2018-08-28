import {GlState} from './GlState';
import {setUniforms, DrawParameters, DepthTest} from '../gl-utils';

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
  const {gl, camera, lampShader: shader, lampObject: geo} = glState;
  const {width, height} = glState.getViewport();
  if (!geo) { return; }

  shader.use(gl);

  const dp = new DrawParameters();
  dp.depth.test = DepthTest.IfLessOrEqual;
  glState.setDrawState(dp);

  gl.viewport(0.0, 0.0, width, height);

  setUniforms(gl, shader, {
    'g_Pmatrix': camera.getProjectionMatrix(width, height),
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


  const {vao, indicesGlType, indexBuffer, triangleCnt} = geo;
  // TODO bind Vao too
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.drawElements(gl.TRIANGLES, triangleCnt * 3, indicesGlType, 0);
};

export const doDraw = (animState: AnimState, scene: GlState) => {
  drawLamp(animState, scene);
  // drawBall(animState, scene);
  // drawManipulators(animState, scene);
};
