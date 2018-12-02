import {Shader, setUniforms, DrawParameters, DepthTest} from 'gl-utils';
import {FrameEnv} from './main';
import {Object3d, Mesh} from 'viewport/scene';
import {Bone} from 'viewport/armature';

const setPerObjectUniforms = (frameEnv: FrameEnv, shader: Shader, object: Object3d) => {
  const {glState: {gl}, scene} = frameEnv;

  setUniforms(gl, shader, {
    'g_MVP': scene.getMVP(object.modelMatrix),
    'g_MV': scene.getMV(object.modelMatrix),
  }, true);

  object.bones.forEach((bone: Bone, i: number) => {
    const boneMat = bone.getFrameMatrix();
    const name = `g_BoneTransforms[${i}]`;
    const location = gl.getUniformLocation(shader.glId, name);
    gl.uniformMatrix4fv(location, false, boneMat);
  });
};

export const drawMesh = (gl: Webgl, shader: Shader) => (mesh: Mesh) => {
  const {vao, indexGlType, indexBuffer, triangleCnt, material} = mesh;

  if (!!material) {
    setUniforms(gl, shader, {
      'g_baseColor': material.baseColor,
    }, true);
  }

  vao.bind(gl);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.drawElements(gl.TRIANGLES, triangleCnt * 3, indexGlType, 0);
};

export const drawObject3d = (frameEnv: FrameEnv, object: Object3d) => {
  const {glState: {gl}, scene} = frameEnv;

  const shader = scene.materialWithArmature;

  const dp = new DrawParameters();
  dp.depth.test = DepthTest.IfLessOrEqual;
  frameEnv.glState.setDrawState(dp);

  shader.use(gl);
  setPerObjectUniforms(frameEnv, shader, object);
  object.meshes.forEach(drawMesh(gl, shader));
};
