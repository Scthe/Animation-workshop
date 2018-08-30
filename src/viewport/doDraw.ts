import {GlState} from './GlState';
import {AnimState, MarkerPosition} from './structs';
import {setUniforms, DrawParameters, DepthTest, CullingMode, transformPointByMat4} from '../gl-utils';
import {calculateBoneMatrices} from './calculateBoneMatrices';
import {mat4, multiply, create as mat4_Create, identity, fromQuat, invert, copy} from 'gl-mat4';
import {fromValues as vec3_Create} from 'gl-vec3';
import {drawLamp} from './drawLamp';
import {getMarkerPositionsFromArmature, drawMarkers} from './drawMarkers';

// TODO move from main to here
// TODO rename to viewport-main.ts
// TODO organize imports in doDraw

// TODO implement click with LMB, camera move with RMB

const identityMatrix = (() => {
  const m = mat4_Create();
  return identity(m);
})();

const createMarkers = (positions: MarkerPosition[]) => {
  const armatureMarkers = positions.map(position => ({
    color: vec3_Create(0, 0, 1),
    position,
    renderable: true,
  }));

  const testMarker = {
    color: vec3_Create(0, 1, 0),
    position: [0.5, 0.5] as any,
    renderable: true,
  };

  return [...armatureMarkers, testMarker];
};

export const doDraw = (animState: AnimState, glState: GlState) => {
  const {lampArmature} = glState;

  const boneTransforms = calculateBoneMatrices(animState, lampArmature);
  drawLamp(animState, glState, boneTransforms, identityMatrix);

  const markerPositions = getMarkerPositionsFromArmature(glState, lampArmature, boneTransforms, identityMatrix);
  const markers = createMarkers(markerPositions);
  drawMarkers(glState, markers);
};
