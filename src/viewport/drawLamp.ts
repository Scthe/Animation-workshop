import {GlState} from './GlState';
import {AnimState} from './main';
import {Shader, setUniforms, DrawParameters, DepthTest} from '../gl-utils';
import {mat4} from 'gl-mat4';

const setLampUniforms = (glState: GlState, shader: Shader, modelMatrix: mat4, boneTransforms: mat4[]) => {
  const {gl, camera} = glState;
  const {width, height} = glState.getViewport();

  setUniforms(gl, shader, {
    'g_Pmatrix': camera.getProjectionMatrix(width, height),
    'g_Vmatrix': camera.getViewMatrix(),
    'g_Mmatrix': modelMatrix,
  }, true);

  boneTransforms.forEach((boneMat: mat4, i: number) => {
    const name = `g_BoneTransforms[${i}]`;
    const location = gl.getUniformLocation(shader.glId, name);
    gl.uniformMatrix4fv(location, false, boneMat);
  });
};

export const drawLamp = (animState: AnimState, glState: GlState, boneTransforms: mat4[], modelMatrix: mat4) => {
  const {gl, lampShader: shader, lampObject: geo} = glState;
  const {vao, indicesGlType, indexBuffer, triangleCnt} = geo;

  const dp = new DrawParameters();
  dp.depth.test = DepthTest.IfLessOrEqual;
  glState.setDrawState(dp);

  shader.use(gl);
  setLampUniforms(glState, shader, modelMatrix, boneTransforms);
  vao.bind(gl);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.drawElements(gl.TRIANGLES, triangleCnt * 3, indicesGlType, 0);
};
