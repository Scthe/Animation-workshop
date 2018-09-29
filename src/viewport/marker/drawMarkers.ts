import {DrawParameters, DepthTest, CullingMode, setUniforms} from 'gl-utils';
import {Marker} from './index';
import {FrameEnv} from 'viewport/main';

const setMarkerUniforms = (frameEnv: FrameEnv, markers: Marker[]) => {
  const {glState: {gl}, scene: {markerMaterial}} = frameEnv;

  // has to be separate expr., cause setUniforms does not check types
  const [width, height] = frameEnv.glState.getViewport();
  setUniforms(gl, markerMaterial, {
    'g_Viewport': [width, height],
  }, true);

  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i];

    const posName = `g_MarkerPositions[${i}]`;
    const position = marker.$_framePosition.positionNDC;
    gl.uniform2fv(gl.getUniformLocation(markerMaterial.glId, posName), position);

    const colName = `g_MarkerColors[${i}]`;
    gl.uniform3fv(gl.getUniformLocation(markerMaterial.glId, colName), marker.color);

    const radName = `g_MarkerRadius[${i}]`;
    gl.uniform1fv(gl.getUniformLocation(markerMaterial.glId, radName), [marker.radius]);
  }
};


const VERTICES_PER_MARKER = 6;

export const drawMarkers = (frameEnv: FrameEnv) => {
  const {glState: {gl}, scene} = frameEnv;
  const {markerMaterial, instancingVAO} = scene;

  const markers = scene.getMarkers();
  const vertexCount = VERTICES_PER_MARKER * markers.length;

  const dp = new DrawParameters();
  dp.depth.write = false;
  dp.depth.test = DepthTest.AlwaysPass;
  dp.culling = CullingMode.None;
  frameEnv.glState.setDrawState(dp);

  markerMaterial.use(gl);
  setMarkerUniforms(frameEnv, markers);
  instancingVAO.bind(gl);
  gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
};
