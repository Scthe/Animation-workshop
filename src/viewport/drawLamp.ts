import {Shader, setUniforms, DrawParameters, DepthTest} from 'gl-utils';
import {mat4} from 'gl-mat4';
import {FrameEnv} from './main';

const setLampUniforms = (frameEnv: FrameEnv, shader: Shader, modelMatrix: mat4, boneTransforms: mat4[]) => {
  const {glState, scene} = frameEnv;
  const {gl} = glState;
  const {camera} = scene;
  const [width, height] = glState.getViewport();

  setUniforms(gl, shader, { // TODO just single MVP?
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

export const drawLamp = (frameEnv: FrameEnv, boneTransforms: mat4[], modelMatrix: mat4) => {
  const {glState, scene} = frameEnv;
  const {gl} = glState;
  const {materialWithArmature: shader, lampMesh: geo} = scene;
  const {vao, indexGlType, indexBuffer, triangleCnt} = geo;

  const dp = new DrawParameters();
  dp.depth.test = DepthTest.IfLessOrEqual;
  glState.setDrawState(dp);

  shader.use(gl);
  setLampUniforms(frameEnv, shader, modelMatrix, boneTransforms);
  vao.bind(gl);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.drawElements(gl.TRIANGLES, triangleCnt * 3, indexGlType, 0);
};
