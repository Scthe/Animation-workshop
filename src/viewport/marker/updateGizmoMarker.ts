import {fromValues as vec3_Create} from 'gl-vec3';
import {mat4} from 'gl-mat4';
import {NDCtoPixels, transformPointByMat4} from '../../gl-utils';
import {GlState} from '../GlState';
import {Marker, MarkerType, createMarkerPosition} from './index';
import {GizmoAxis} from '../drawGizmos';


// @see getMoveGizmoMarkerRadius
const GIZMO_RADIUS_TEST_VECTORS = [
  vec3_Create(0.0, 1.0, 0.0), // TODO this line is not needed, always shortest of the 3
  vec3_Create(0.1, 1.0, 0.0), // fix problems when looking directly down the axis
  vec3_Create(0.0, 1.0, 0.1),
];
const GIZMO_MOVE_TIP = vec3_Create(0, 0.9, 0); // about right in the middle of the tip

export const getMoveGizmoMarkerRadius = (glState: GlState, mvp: mat4, marker: Marker) => {
  // we calculate difference between [0, 0.9, 0], which is middle of arrow tip
  // and [0, 1, 0], which is exact arrow tip
  // ugh, I actually want to do normal object picking ATM...

  const {width, height} = glState.getViewport();
  const markerPos = marker.position.positionNDC;
  const m1 = NDCtoPixels(markerPos, width, height, false);

  const radiuses = GIZMO_RADIUS_TEST_VECTORS.map(ar => {
    // calculate NDC of [0, 1, 0] etc.
    const markerTmp = vec3_Create(0, 0, 0);
    transformPointByMat4(markerTmp, ar, mvp);

    // calculate difference in pixels as radius
    const m2 = NDCtoPixels(markerTmp, width, height, false);
    const deltaTmp = [m1[0] - m2[0], m1[1] - m2[1]];
    return Math.sqrt(deltaTmp[0] * deltaTmp[0] + deltaTmp[1] * deltaTmp[1]);
  });

  return radiuses.reduce((acc, r) => Math.max(acc, r), 0);
};

export const updateMoveGizmoMarker = (glState: GlState, mvp: mat4, modelMatrix: mat4, axis: GizmoAxis) => {
  const markerName = GizmoAxis[axis];

  // update position
  const markerPos = createMarkerPosition(mvp, modelMatrix, GIZMO_MOVE_TIP);
  glState.updateMarker(markerName, MarkerType.GizmoMove, markerPos);

  // set raidus based on view
  const marker = glState.getMarker(markerName, MarkerType.GizmoMove);
  marker.radius = getMoveGizmoMarkerRadius(glState, mvp, marker);
};
