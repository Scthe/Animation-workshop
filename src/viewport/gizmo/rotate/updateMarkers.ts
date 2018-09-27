import {vec3, fromValues as vec3_Create, normalize, distance} from 'gl-vec3';
import {mat4, create as mat4_Create} from 'gl-mat4';
import {Axis, AxisList, createModelMatrix} from 'gl-utils';
import {FrameEnv} from 'viewport/main';
import {createMarkerPosition, MarkerType, MarkerPosition} from '../../marker';
import {GizmoDrawOpts, AXIS_COLORS} from '../index';

// TODO when rotation, rotate gizmo too (or hide alltogether)

// marker for axis X is at [0,1,1] etc.
const MARKER_VECTOR_BY_AXIS = (
  () => {
    const markerAxis = [
      [0, 1, 1], // X
      [1, 0, 1], // Y
      [1, 1, 0], // Z
    ];
    return markerAxis.map((vec: any) => {
      const v = vec3_Create(0, 0, 0);
      return normalize(v, vec);
    });
  }
)();

const CIRCLE_QUATER_MODS = [
  [ 1,  1],
  [-1,  1],
  [ 1, -1],
  [-1, -1],
];

/**
 * On each circle, there are 4 possible positions where marker can be
 * (each position is in separate quater)
 */
const getClosestMarkerPosition = (cameraPos: vec3, mvp: mat4, modelMat: mat4, axis: Axis) => {
  const markerVec = MARKER_VECTOR_BY_AXIS[axis] as any;

  const markerPositions = CIRCLE_QUATER_MODS.map(mod => {
    const [x, y, z] = markerVec;
    const [a, b] = mod; // multiply factors, either 1 or -1
    let v;

    if (x === 0) { v = vec3_Create(    0, a * y, b * z); }
    if (y === 0) { v = vec3_Create(a * x,     0, b * z); }
    if (z === 0) { v = vec3_Create(a * x, b * y,     0); }

    return createMarkerPosition(mvp, modelMat, v);
  });

  const getClosest = (acc: MarkerPosition, p: MarkerPosition) => {
    const accDist = acc ? distance(cameraPos, acc.position3d) : Infinity; // redundant, but meh..
    const pDist = distance(cameraPos, p.position3d);
    return pDist < accDist ? p : acc;
  };

  return markerPositions.reduce(getClosest, undefined);
};

export const updateMarkers = (frameEnv: FrameEnv, opts: GizmoDrawOpts) => {
  const {scene, glState} = frameEnv;
  const {origin, size} = opts;
  const markerPos = origin.position.position3d;

  // similar matrix to one used in draw, but no rotation
  const rotMat = mat4_Create();
  const modelMatrix = createModelMatrix(markerPos, rotMat, size);
  const mvp = glState.getMVP(modelMatrix, scene.camera);

  AxisList.forEach(axis => {
    const markerPos = getClosestMarkerPosition(scene.camera.getPosition(), mvp, modelMatrix, axis);
    const markerName = Axis[axis];
    const marker = glState.updateMarker(markerName, MarkerType.GizmoRotate, markerPos);
    marker.color = AXIS_COLORS[axis];
  });
};
