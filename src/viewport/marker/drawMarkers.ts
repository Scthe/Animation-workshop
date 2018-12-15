import {DrawParameters, DepthTest, CullingMode, setUniforms} from 'gl-utils';
import {Marker, MarkerType} from './index';
import {FrameEnv} from 'viewport/main';


const setMarkerUniforms = (frameEnv: FrameEnv, markers: Marker[], scale: number) => {
  const {
    glState: {gl},
    scene: {markerMeta, camera},
    selectedMarker
  } = frameEnv;
  const {shader} = markerMeta;

  setUniforms(gl, shader, {
    'g_VP': frameEnv.scene.getVP(),
    'g_V': camera.getViewMatrix(),
  }, true);

  const isSelected = (marker: Marker) => selectedMarker && marker.name === selectedMarker.name;

  markers.forEach((marker, i) => {
    const posName = `g_MarkerPositions[${i}]`;
    gl.uniform3fv(gl.getUniformLocation(shader.glId, posName), marker.$position3d);

    const colName = `g_MarkerColors[${i}]`;
    const color = marker.getColor(isSelected(marker));
    gl.uniform3fv(gl.getUniformLocation(shader.glId, colName), color);

    const radName = `g_MarkerRadius[${i}]`; // col/pos are vec3, this is [single number]
    const radius = marker.getRadius(scale);
    gl.uniform1fv(gl.getUniformLocation(shader.glId, radName), [radius]);
  });
};

const getVisibleMarkers = (allMarkers: Marker[], showDebug: boolean) => {
  return allMarkers.filter(marker => {
    const visibleByDebug = marker.type !== MarkerType.Debug || showDebug;
    return marker.visible && visibleByDebug;
  });
};

const VERTICES_PER_MARKER = 6;

export const drawMarkers = (frameEnv: FrameEnv, scale: number, showDebug: boolean) => {
  const {glState: {gl}, scene} = frameEnv;
  const {shader, instancingVAO} = scene.markerMeta;

  const markers = getVisibleMarkers(scene.getMarkers(), showDebug);
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
