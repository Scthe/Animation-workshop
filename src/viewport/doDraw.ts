import {GlState} from './GlState';
import {setUniforms, DrawParameters, DepthTest, CullingMode, transformPointByMat4} from '../gl-utils';
import {getBoneTransforms} from './skeleton';
import {mat4, multiply, create as mat4_Create, identity, fromQuat, invert} from 'gl-mat4';

export interface AnimState {
  deltaTime: number; // previous -> this frame
  animationFrameId: number; // frame to render, used for interpolation etc.
  frameId: number; // id of current frame
}

/*
const identityMatrix = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1];*/
const identityMatrix = (() => {
  const m = mat4_Create();
  return identity(m);
})();

const drawLamp = (animState: AnimState, glState: GlState) => {
  const {gl, camera, lampShader: shader, lampObject: geo, lampArmature: armature} = glState;
  const {width, height} = glState.getViewport();
  if (!geo) { return; }

  shader.use(gl);

  const dp = new DrawParameters();
  dp.depth.test = DepthTest.IfLessOrEqual;
  glState.setDrawState(dp);


  setUniforms(gl, shader, {
    'g_Pmatrix': camera.getProjectionMatrix(width, height),
    'g_Vmatrix': camera.getViewMatrix(),
    'g_Mmatrix': identityMatrix,
  }, true);

  const boneTransforms = getBoneTransforms(animState, armature);
  boneTransforms.forEach((boneMat: mat4, i: number) => {
    const name = `g_BoneTransforms[${i}]`;
    const location = gl.getUniformLocation(shader.glId, name);
    gl.uniformMatrix4fv(location, false, boneMat);
  });


  const {vao, indicesGlType, indexBuffer, triangleCnt} = geo;

  vao.bind(gl);
  gl.viewport(0.0, 0.0, width, height);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.drawElements(gl.TRIANGLES, triangleCnt * 3, indicesGlType, 0);

  return boneTransforms;
};

const getMarkerViewportPositions = (glState: GlState, boneTransforms: mat4[]) => {
  const {lampArmature, camera} = glState;
  const {width, height} = glState.getViewport();
  const p = camera.getProjectionMatrix(width, height);
  const v = camera.getViewMatrix();
  const m = identityMatrix;
  const mvp = mat4_Create(), tmp = mat4_Create();
  multiply(tmp, p, v);
  multiply(mvp, tmp, m);

  const getParentBindMatrix = (boneIdx: number) => {
    const bindMat = mat4_Create();
    const parentBone = lampArmature.filter(b => b.children.indexOf(boneIdx) !== -1)[0];

    if (!parentBone) {
      identity(bindMat);
    } else {
      invert(bindMat, parentBone.inverseBindMatrix);
    }
    return bindMat;
  };

  return boneTransforms.map((boneMat, idx) => {
    const bone = lampArmature[idx];
    const bonePos = bone.translation; // relative to parent
    const pos = [0, 0, 0]; // TODO ?

    // const rotMat = mat4_Create();
    // fromQuat(rotMat, bone.rotation);
    // transformPointByMat4(pos as any, bonePos, rotMat);
    // const bindMat = mat4_Create();
    // invert(bindMat, bone.inverseBindMatrix); // TODO from parent?
    const bindMat = getParentBindMatrix(idx);
    transformPointByMat4(pos as any, bonePos, bindMat);

    const localPos = [0, 0, 0];
    const result = [0, 0, 0];
    transformPointByMat4(localPos as any, pos as any, boneMat);
    transformPointByMat4(result as any, localPos as any, mvp);

    return [result[0], result[1]];
  });
};


const VERTICES_PER_MARKER = 6;

const drawMarkers = (glState: GlState, markerPositions: any[]) => {
  const {gl, markersShader: shader, markersVao: vao} = glState;
  const {width, height} = glState.getViewport();

  // const markerPositions = [[0.2, 0.5], [-0.2, 0.5]];

  shader.use(gl);

  const dp = new DrawParameters();
  dp.depth.write = false;
  dp.depth.test = DepthTest.AlwaysPass;
  dp.culling = CullingMode.None;
  glState.setDrawState(dp);

  setUniforms(gl, shader, {
    'g_Viewport': [width, height],
  }, true);
  markerPositions.forEach((value: any, i: number) => {
    const name = `g_MarkerPositions[${i}]`;
    const location = gl.getUniformLocation(shader.glId, name);
    gl.uniform2fv(location, value);
  });

  vao.bind(gl);
  gl.viewport(0.0, 0.0, width, height);
  const vertexCount = VERTICES_PER_MARKER * markerPositions.length;
  // const vertexCount = VERTICES_PER_MARKER * 2;
  gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
};

let debug = true;

export const doDraw = (animState: AnimState, glState: GlState) => {
  const boneTransforms = drawLamp(animState, glState);

  const markerPositions = getMarkerViewportPositions(glState, boneTransforms);

  drawMarkers(glState, markerPositions);

  if (debug) {
    console.log(`--- markerPositions ---`);

    // console.log(markerPositions);
    markerPositions.forEach(e => console.log(e));
    debug = false;
    console.log(`--- markerPositions ---`);
  }

  // drawBall(animState, scene);
  // drawManipulators(animState, scene);
};
