import {vec3, fromValues as vec3_Create} from 'gl-vec3';
import {mat4} from 'gl-mat4';
import {NDCtoPixels, transformPointByMat4, getDist2} from 'gl-utils';
import {GlState} from 'viewport/GlState';
import {Marker} from 'viewport/marker';


const GIZMO_MOVE_TIP = vec3_Create(0.0, 0.9, 0.0);

// @see getMarkerRadius
// fix problems when looking directly down the axis
const GIZMO_RADIUS_TEST_VECTORS = [
  vec3_Create(0.0, 1.0, 0.0), // this line is not needed, always shortest of the 3
  vec3_Create(0.1, 1.0, 0.0),
  vec3_Create(0.0, 1.0, 0.1),
];

const getPixelPos = (glState: GlState, mvp: mat4) => (point: vec3) => {
  const [width, height] = glState.getViewport();

  // calculate NDC
  const screenPos = transformPointByMat4(vec3_Create(0, 0, 0), point, mvp);

  return NDCtoPixels(screenPos, width, height, false);
};

export const getMarkerRadius = (glState: GlState, mvp: mat4, marker: Marker) => {
  // we calculate difference between [0, 0.9, 0], which is middle of arrow tip
  // and [0, 1, 0], which is exact arrow tip
  // ugh, I actually want to do normal object picking ATM...
  const getPixelPos_ = getPixelPos(glState, mvp);

  const arrowCenterPx = getPixelPos_(GIZMO_MOVE_TIP);

  const radiuses = GIZMO_RADIUS_TEST_VECTORS.map(testVec => {
    const pixelPos = getPixelPos_(testVec);
    return getDist2(arrowCenterPx, pixelPos, true);
  });

  return radiuses.reduce((acc, r) => Math.max(acc, r), 0);
};
