import {mat4} from 'gl-mat4';
import {vec3, create as vec3_Create} from 'gl-vec3';
import {fromValues as vec2_Create} from 'gl-vec2';
import {
  setUniforms,
  DrawParameters, DepthTest, CullingMode,
  transformPointByMat4, hexToVec3,
  Shader,
  Vao, VaoAttrInit
} from '../gl-utils';
import {Armature, Bone, AnimState, MarkerType, Marker} from './structs';
import {GlState} from './GlState';

// TODO rename to Markers.ts, put interfaces here? or separate folder?

// Marker:
// rendered as dot in viewport, indicates e.g. selectable bone or object
// Used also for gizmo click-handling etc.


export const getMarkerRadius = (marker: Marker) => {
  switch (marker.type) {
    case MarkerType.GizmoMove: return marker.radius || 20;

    // case MarkerType.Armature: return hexToVec3('#823ab9');
    // case MarkerType.GizmoRotate: return hexToVec3('#3aa2b9');
    default: return 5;
  }
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
/// Marker calculations
//////////

export const createMarkerPosition = (mvp: mat4, modelMatrix: mat4, pos: vec3) => {
  const resultNDC = vec3_Create();
  transformPointByMat4(resultNDC, pos, mvp);

  const position3d = vec3_Create();
  transformPointByMat4(position3d, pos, modelMatrix);

  return {
    position3d,
    positionNDC: vec2_Create(resultNDC[0], resultNDC[1]),
  };
};

const getMarkerPosFromBone = (armature: Armature, mvp: mat4, modelMatrix: mat4) => (bone: Bone, boneMat: mat4) => {
  const bonePos = bone.translation; // relative to parent

  // same steps as normal bone calculations, but on CPU this time
  const pos = vec3_Create(); // reverse bone transform
  transformPointByMat4(pos, bonePos, bone.getParentBindMatrix(armature));
  const localPos = vec3_Create(); // apply new bone transform
  transformPointByMat4(localPos, pos, boneMat);

  return createMarkerPosition(mvp, modelMatrix, localPos);
};

export const updateArmatureMarkers = (glState: GlState, armature: Armature, boneTransforms: mat4[], modelMatrix: mat4) => {
  const mvp = glState.getMVP(modelMatrix);
  const getMarkerFromBone_ = getMarkerPosFromBone(armature, mvp, modelMatrix);

  return boneTransforms.forEach((boneMat, idx) => {
    const bone = armature[idx];
    const newPosition = getMarkerFromBone_(bone, boneMat);
    glState.updateMarker(bone.name, MarkerType.Armature, newPosition);
  });
};


//////////
/// Marker drawing
//////////

const getMarkerColor = (marker: Marker) => {
  switch (marker.type) {
    case MarkerType.Armature: return hexToVec3('#823ab9');
    case MarkerType.GizmoMove: return hexToVec3('#b93a46');
    case MarkerType.GizmoRotate: return hexToVec3('#3aa2b9');
    default: return hexToVec3('#4fee55');
  }
};

const setMarkerUniforms = (animState: AnimState, glState: GlState, shader: Shader, markers: Marker[]) => {
  const {gl} = glState;
  const {width, height} = glState.getViewport();

  setUniforms(gl, shader, {
    'g_Viewport': [width, height],
  }, true);

  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i];

    const posName = `g_MarkerPositions[${i}]`;
    const position = marker.position.positionNDC;
    gl.uniform2fv(gl.getUniformLocation(shader.glId, posName), position);

    const colName = `g_MarkerColors[${i}]`;
    gl.uniform3fv(gl.getUniformLocation(shader.glId, colName), getMarkerColor(marker));

    const radName = `g_MarkerRadius[${i}]`;
    gl.uniform1fv(gl.getUniformLocation(shader.glId, radName), [getMarkerRadius(marker)]);
  }
};


const VERTICES_PER_MARKER = 6;

export const drawMarkers = (animState: AnimState, glState: GlState) => {
  const {gl, markersShader: shader, markersVao: vao} = glState;

  const markers = glState.getMarkers((marker: Marker) => {
    return true;
  });
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
