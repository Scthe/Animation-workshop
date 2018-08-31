import {map as loMap} from 'lodash';
import {mat4} from 'gl-mat4';
import {create as vec3_Create} from 'gl-vec3';
import {fromValues as vec2_Create} from 'gl-vec2';
import {
  setUniforms,
  DrawParameters, DepthTest, CullingMode,
  transformPointByMat4, lerp, hexToVec3,
  Shader,
  Vao, VaoAttrInit
} from '../gl-utils';
import {Marker, Armature, AnimState} from './structs';
import {GlState} from './GlState';
import {getSelectedObject} from '../UI_State';


// Marker:
// rendered as dot in viewport, indicates e.g. selectable bone or object
// Used also for gizmo click-handling etc.

const MARKER_RADIUS = 12;
const MARKER_PULSE_INCREASE = 1.2;
const MARKER_PULSE_TIME = 30;

const MARKER_COLORS = {
  BONE: hexToVec3(0xca38cd),
  OBJECT: hexToVec3(0x59f65f),
};

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

export const getMarkersFromArmature = (glState: GlState, armature: Armature, boneTransforms: mat4[], modelMatrix: mat4) => {
  const mvp = glState.getMVP(modelMatrix);

  return boneTransforms.map((boneMat, idx) => {
    const bone = armature[idx];
    const bonePos = bone.translation; // relative to parent

    // same steps as normal bone calculations, but on CPU this time
    const pos = vec3_Create(); // reverse bone transform
    transformPointByMat4(pos, bonePos, bone.getParentBindMatrix(armature));
    const localPos = vec3_Create(); // apply new bone transform
    transformPointByMat4(localPos, pos, boneMat);

    // calc positions
    const resultNDC = vec3_Create();
    transformPointByMat4(resultNDC, localPos, mvp);
    const result3d = vec3_Create();
    transformPointByMat4(result3d, localPos, modelMatrix);

    return {
      name: `Bone${idx}`,
      radius: 0,
      color: MARKER_COLORS.BONE,
      position3d: result3d,
      positionNDC: vec2_Create(resultNDC[0], resultNDC[1]),
      renderable: true,
    };
  });
};


const VERTICES_PER_MARKER = 6;

const getPulseRadius = (animState: AnimState) => {
  let pulseTiming = animState.frameId % (2 * MARKER_PULSE_TIME);
  pulseTiming = pulseTiming < MARKER_PULSE_TIME
    ? pulseTiming
    : MARKER_PULSE_TIME - (pulseTiming % MARKER_PULSE_TIME);
  pulseTiming = pulseTiming / MARKER_PULSE_TIME;

  return MARKER_RADIUS * lerp(1, MARKER_PULSE_INCREASE, pulseTiming);
};

const isActiveMarker = (marker: Marker) => {
  const selectedObj = getSelectedObject();
  const selectedMarkerName = selectedObj ? selectedObj.name : undefined;
  return selectedMarkerName === marker.name;
};

const getMarkerSize = (pulseRadius: number) => (marker: Marker) => {
  return isActiveMarker(marker) ? pulseRadius : MARKER_RADIUS;
};

const setMarkerUniforms = (animState: AnimState, glState: GlState, shader: Shader, markers: Marker[]) => {
  const {gl} = glState;
  const {width, height} = glState.getViewport();
  const pulseRadius = getPulseRadius(animState);

  const markerPositions = loMap(markers, 'positionNDC');
  const markerColors = loMap(markers, 'color');
  const markerRadius = markers.map(getMarkerSize(pulseRadius));

  setUniforms(gl, shader, {
    'g_Viewport': [width, height],
  }, true);

  for (let i = 0; i < markers.length; i++) {
    const posName = `g_MarkerPositions[${i}]`;
    gl.uniform2fv(gl.getUniformLocation(shader.glId, posName), markerPositions[i]);
    const colName = `g_MarkerColors[${i}]`;
    gl.uniform3fv(gl.getUniformLocation(shader.glId, colName), markerColors[i]);
    const radName = `g_MarkerRadius[${i}]`;
    gl.uniform1fv(gl.getUniformLocation(shader.glId, radName), [markerRadius[i]]);

    markers[i].radius = markerRadius[i];
  }
};

export const drawMarkers = (animState: AnimState, glState: GlState, allMarkers: Marker[]) => {
  const {gl, markersShader: shader, markersVao: vao} = glState;
  const markers = allMarkers.filter(m => m.renderable);
  const vertexCount = VERTICES_PER_MARKER * markers.length;

  const dp = new DrawParameters();
  dp.depth.write = false;
  dp.depth.test = DepthTest.AlwaysPass;
  dp.culling = CullingMode.None;
  glState.setDrawState(dp);

  shader.use(gl);
  setMarkerUniforms(animState, glState, shader, markers);
  vao.bind(gl);
  gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
};
