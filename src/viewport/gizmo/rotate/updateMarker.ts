import {vec3, fromValues as vec3_Create, normalize, distance} from 'gl-vec3';
import {mat4} from 'gl-mat4';
import {Scene} from 'viewport/scene';
import {createMarkerPosition, MarkerPosition} from 'viewport/marker';

/**
 * ugh.., nice API You got there. Why didn't You make `out` the last (optional) arg?
 * If I have gc problems, I can solve them myself. Meanwhile I'm stuck using this
 * shit 100% of the time
 */
const norm = (vec: vec3) => {
  const result = vec3_Create(0, 0, 0);
  return normalize(result, vec);
};

/**
 * On each circle, there are 4 possible positions where marker can be
 * (each position is in separate quater)
 *
 * NOTE: default mesh has height ~0 and spans XZ axis
 */
const CIRCLE_QUATERS_POINTS = [
  norm(vec3_Create( 1, 0,  1)),
  norm(vec3_Create(-1, 0,  1)),
  norm(vec3_Create( 1, 0, -1)),
  norm(vec3_Create(-1, 0, -1)),
];

const getClosestToRef = (refPoint: vec3) => (acc: MarkerPosition, p: MarkerPosition) => {
  const accDist = acc ? distance(refPoint, acc.position3d) : Infinity; // redundant, but meh..
  const pDist = distance(refPoint, p.position3d);
  return pDist < accDist ? p : acc;
};

export const updateMarker = (scene: Scene, mvp: mat4, modelMatrix: mat4) => {
  const quatersPositions = CIRCLE_QUATERS_POINTS.map(pointMod => {
    return createMarkerPosition(mvp, modelMatrix, pointMod);
  });

  const cameraPos = scene.camera.getPosition();
  const closestToCamera = getClosestToRef(cameraPos);
  return quatersPositions.reduce(closestToCamera, undefined);
};
