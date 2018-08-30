import {GlState} from './GlState';
import {setUniforms, DrawParameters, DepthTest, CullingMode, transformPointByMat4, Shader, Vao, VaoAttrInit} from '../gl-utils';
import {mat4} from 'gl-mat4';
import {create as vec3_Create} from 'gl-vec3';
import {fromValues as vec2_Create} from 'gl-vec2';
import {Marker, MarkerPosition, Armature} from './structs';
import {map as loMap} from 'lodash';

// Marker:
// rendered as dot in viewport, indicates e.g. selectable bone or object
// Used also for gizmo click-handling etc.


//////////
/// Some init stuff
//////////

const MARKER_VAO_SIZE = 255;

export const createMarkersVao = (gl: Webgl, shader: Shader) => {
  const data = new Float32Array(MARKER_VAO_SIZE);
  for (let i = 0; i < MARKER_VAO_SIZE; i++) {
    data[i] = i;
  }

  return new Vao(gl, shader, [
    new VaoAttrInit('a_VertexId_f', data, 0, 0),
  ]);
};

//////////
/// Actual calculations and drawing
//////////

export const getMarkerPositionsFromArmature = (glState: GlState, armature: Armature, boneTransforms: mat4[], modelMatrix: mat4) => {
  const mvp = glState.getMVP(modelMatrix);

  return boneTransforms.map((boneMat, idx) => {
    const bone = armature[idx];
    const bonePos = bone.translation; // relative to parent

    // same steps as normal bone calculations, but on CPU this time
    const pos = vec3_Create(); // reverse bone transform
    transformPointByMat4(pos, bonePos, bone.getParentBindMatrix(armature));
    const localPos = vec3_Create(); // apply new bone transform
    transformPointByMat4(localPos, pos, boneMat);
    const result = vec3_Create(); // apply mvp
    transformPointByMat4(result, localPos, mvp);

    return vec2_Create(result[0], result[1]);
  });
};


const VERTICES_PER_MARKER = 6;

const setMarkerUniforms = (glState: GlState, shader: Shader, markers: Marker[]) => {
  const {gl} = glState;
  const {width, height} = glState.getViewport();

  const markerPositions = loMap(markers, 'position');
  const markerColors = loMap(markers, 'color');

  setUniforms(gl, shader, {
    'g_Viewport': [width, height],
  }, true);

  for (let i = 0; i < markers.length; i++) {
    const posName = `g_MarkerPositions[${i}]`;
    gl.uniform2fv(gl.getUniformLocation(shader.glId, posName), markerPositions[i]);
    const colName = `g_MarkerColors[${i}]`;
    gl.uniform3fv(gl.getUniformLocation(shader.glId, colName), markerColors[i]);
  }
};

export const drawMarkers = (glState: GlState, allMarkers: Marker[]) => {
  const {gl, markersShader: shader, markersVao: vao} = glState;
  const {width, height} = glState.getViewport();

  const markers = allMarkers.filter(m => m.renderable);
  const vertexCount = VERTICES_PER_MARKER * markers.length;

  const dp = new DrawParameters();
  dp.depth.write = false;
  dp.depth.test = DepthTest.AlwaysPass;
  dp.culling = CullingMode.None;
  glState.setDrawState(dp);

  shader.use(gl);
  setMarkerUniforms(glState, shader, markers);
  vao.bind(gl);
  gl.viewport(0.0, 0.0, width, height);
  gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
};
