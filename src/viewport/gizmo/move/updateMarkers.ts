import {fromValues as vec3_Create} from 'gl-vec3';
import {mat4} from 'gl-mat4';
import {NDCtoPixels, transformPointByMat4, getDist2} from 'gl-utils';
import {GlState} from 'viewport/GlState';
import {Marker, createMarkerPosition} from 'viewport/marker';
import {Axis} from 'gl-utils';
import {FrameEnv} from 'viewport/main';

/// Move gizmo uses weird shape - arrow. Implmenting picking requires
/// some special code.
///
/// Basically, we are going to place circular markers at the end of the arrows.
/// When the marker is clicked, the move translation will occur (after drag)

// @see getMarkerRadius
// fix problems when looking directly down the axis
const GIZMO_RADIUS_TEST_VECTORS = [
  vec3_Create(0.0, 1.0, 0.0), // this line is not needed, always shortest of the 3
  vec3_Create(0.1, 1.0, 0.0),
  vec3_Create(0.0, 1.0, 0.1),
];
const GIZMO_MOVE_TIP = vec3_Create(0, 0.9, 0); // about right in the middle of the tip

const getMarkerRadius = (glState: GlState, mvp: mat4, marker: Marker) => {
  // we calculate difference between [0, 0.9, 0], which is middle of arrow tip
  // and [0, 1, 0], which is exact arrow tip
  // ugh, I actually want to do normal object picking ATM...

  const [width, height] = glState.getViewport();
  const markerPos = marker.$_framePosition.positionNDC;
  const m1 = NDCtoPixels(markerPos, width, height, false);

  const radiuses = GIZMO_RADIUS_TEST_VECTORS.map(ar => {
    // calculate NDC of [0, 1, 0] etc.
    const markerTmp = vec3_Create(0, 0, 0);
    transformPointByMat4(markerTmp, ar, mvp);

    // calculate difference in pixels as radius
    const m2 = NDCtoPixels(markerTmp, width, height, false);
    return getDist2(m1, m2, true);
  });

  return radiuses.reduce((acc, r) => Math.max(acc, r), 0);
};

export const updateMarkers = (frameEnv: FrameEnv, mvp: mat4, modelMatrix: mat4, axis: Axis) => {
  const {glState, scene} = frameEnv;

  // update position and radius
  const markerPos = createMarkerPosition(mvp, modelMatrix, GIZMO_MOVE_TIP);
  const marker = scene.updateMarker(axis, markerPos);
  marker.radius = getMarkerRadius(glState, mvp, marker);
};
