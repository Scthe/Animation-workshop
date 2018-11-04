import {vec3, fromValues as vec3_Create, normalize, distance} from 'gl-vec3';
import {mat4} from 'gl-mat4';
import {transformPointByMat4} from 'gl-utils';
import {createPlaneFromPoints} from 'gl-utils/raycast';

/**
 * ugh.., nice API You got there. Why didn't You make `out` the last (optional) arg?
 * If I have gc problems, I can solve them myself. Meanwhile I'm stuck using this
 * shit 100% of the time
 */
const norm = (vec: vec3) => normalize(vec3_Create(0, 0, 0), vec);

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

export const calcDraggableHandlePos = (modelMatrix: mat4, cameraPos: vec3) => {
  const possiblePositions = CIRCLE_QUATERS_POINTS.map(posLS => {
    const posWs = transformPointByMat4(posLS, modelMatrix, true);
    return {
      position: posWs,
      distance: distance(posWs, cameraPos),
    };
  });

  const getClosest = (acc_currClosestIdx: number, _: any, i: number) => {
    const currClosest = possiblePositions[acc_currClosestIdx];
    const item = possiblePositions[i];
    return item.distance < currClosest.distance ? i : acc_currClosestIdx;
  };

  const closestIdx = possiblePositions.reduce(getClosest, 0);
  const [a, b, c] = possiblePositions.map(e => e.position).slice(0, 3);

  return {
    handlePos: possiblePositions[closestIdx].position,
    rotationPlane: createPlaneFromPoints(a, b, c),
  };
};
