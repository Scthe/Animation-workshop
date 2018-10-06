import {mat4} from 'gl-mat4';
import {vec3, create as vec3_Create} from 'gl-vec3';
import {fromValues as vec2_Create} from 'gl-vec2';
import {transformPointByMat4} from 'gl-utils';

export * from './Marker';
export * from './drawMarkers';
export * from './getMarkerAt';

export const createMarkerPosition = (mvp: mat4, modelMatrix: mat4, pos: vec3) => {
  const resultNDC = transformPointByMat4(vec3_Create(), pos, mvp);
  const position3d = transformPointByMat4(vec3_Create(), pos, modelMatrix);

  return {
    position3d,
    positionNDC: vec2_Create(resultNDC[0], resultNDC[1]),
  };
};
