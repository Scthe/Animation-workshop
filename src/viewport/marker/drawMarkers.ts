import {
  DrawParameters, DepthTest, CullingMode,
  Shader, setUniforms, hexToVec3,
  Vao, VaoAttrInit
} from 'gl-utils';
import {MarkerType, Marker, getMarkerRadius} from './index';
import {GlState} from 'viewport/GlState';
import {AnimState} from 'viewport/main';


let MARKER_VAO: Vao = undefined;
let MARKER_SHADER: Shader = undefined;


//////////
/// Some init stuff
//////////

const MARKER_VAO_SIZE = 255;
const MARKER_VERT = require('shaders/marker.vert.glsl');
const MARKER_FRAG = require('shaders/marker.frag.glsl');

export const initMarkersDraw = (gl: Webgl) => {
  MARKER_SHADER = new Shader(gl, MARKER_VERT, MARKER_FRAG);

  const data = new Float32Array(MARKER_VAO_SIZE);
  for (let i = 0; i < MARKER_VAO_SIZE; i++) {
    data[i] = i;
  }

  MARKER_VAO = new Vao(gl, MARKER_SHADER, [
    new VaoAttrInit('a_VertexId_f', data, 0, 0),
  ]);
};


//////////
/// Marker drawing
//////////

const getMarkerColor = (marker: Marker) => {
  if (marker.color) {
    return marker.color;
  }

  switch (marker.type) {
    case MarkerType.Armature: return hexToVec3('#823ab9');
    case MarkerType.GizmoMove: return hexToVec3('#b93a46');
    case MarkerType.GizmoRotate: return hexToVec3('#6eb1bf'); // actually, will use per-axis colors
    default: return hexToVec3('#4fee55');
  }
};

const setMarkerUniforms = (animState: AnimState, glState: GlState, markers: Marker[]) => {
  const {gl} = glState;
  const [width, height] = glState.getViewport();

  setUniforms(gl, MARKER_SHADER, {
    'g_Viewport': [width, height],
  }, true);

  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i];

    const posName = `g_MarkerPositions[${i}]`;
    const position = marker.position.positionNDC;
    gl.uniform2fv(gl.getUniformLocation(MARKER_SHADER.glId, posName), position);

    const colName = `g_MarkerColors[${i}]`;
    gl.uniform3fv(gl.getUniformLocation(MARKER_SHADER.glId, colName), getMarkerColor(marker));

    const radName = `g_MarkerRadius[${i}]`;
    gl.uniform1fv(gl.getUniformLocation(MARKER_SHADER.glId, radName), [getMarkerRadius(marker)]);
  }
};


const VERTICES_PER_MARKER = 6;

export const drawMarkers = (animState: AnimState, glState: GlState) => {
  const {gl} = glState;

  const markers = glState.getMarkers();
  const vertexCount = VERTICES_PER_MARKER * markers.length;

  const dp = new DrawParameters();
  dp.depth.write = false;
  dp.depth.test = DepthTest.AlwaysPass;
  dp.culling = CullingMode.None;
  glState.setDrawState(dp);

  MARKER_SHADER.use(gl);
  setMarkerUniforms(animState, glState, markers);
  MARKER_VAO.bind(gl);
  gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
};
