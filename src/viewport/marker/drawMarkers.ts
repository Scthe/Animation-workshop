import {DrawParameters, DepthTest, CullingMode, setUniforms} from 'gl-utils';
import {Marker, MarkerType, SELECTED_BONE_COLOR} from './index';
import {FrameEnv} from 'viewport/main';

const getMarkerColor = (frameEnv: FrameEnv, marker: Marker) => {
  const selectedObj = frameEnv.glState.selectedObject;
  return selectedObj === marker.name ? SELECTED_BONE_COLOR : marker.color;
};

const setMarkerUniforms = (frameEnv: FrameEnv, markers: Marker[], scale: number) => {
  const {glState: {gl}, scene: {markerMeta}} = frameEnv;
  const {shader} = markerMeta;

  // has to be separate expr., cause setUniforms does not check types
  const [width, height] = frameEnv.glState.getViewport();
  setUniforms(gl, shader, {
    'g_Viewport': [width, height],
  }, true);

  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i];

    const posName = `g_MarkerPositions[${i}]`;
    const position = marker.$_framePosition.positionNDC;
    gl.uniform2fv(gl.getUniformLocation(shader.glId, posName), position);

    const colName = `g_MarkerColors[${i}]`;
    gl.uniform3fv(gl.getUniformLocation(shader.glId, colName), getMarkerColor(frameEnv, marker));

    const radName = `g_MarkerRadius[${i}]`; // col/pos are vec3, this is [single number]
    const mScale = marker.type === MarkerType.Bone ? scale : 1.0;
    gl.uniform1fv(gl.getUniformLocation(shader.glId, radName), [marker.radius * mScale]);
  }
};


const VERTICES_PER_MARKER = 6;

export const drawMarkers = (frameEnv: FrameEnv, scale: number) => {
  const {glState: {gl}, scene} = frameEnv;
  const {shader, instancingVAO} = scene.markerMeta;

  const markers = scene.getMarkers().filter(m => m.visible);
  const vertexCount = VERTICES_PER_MARKER * markers.length;

  const dp = new DrawParameters();
  dp.depth.write = false;
  dp.depth.test = DepthTest.AlwaysPass;
  dp.culling = CullingMode.None;
  frameEnv.glState.setDrawState(dp);

  shader.use(gl);
  setMarkerUniforms(frameEnv, markers, scale);
  instancingVAO.bind(gl);
  gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
};
