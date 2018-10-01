import {fromValues as vec3_Create} from 'gl-vec3';
import {
  mat4, create as mat4_Create, multiply,
  fromScaling, fromXRotation, fromZRotation,
} from 'gl-mat4';
import {
  Axis, AxisList, toRadians,
  setUniforms, DrawParameters, DepthTest, CullingMode
} from 'gl-utils';
import {Bone} from 'viewport/armature';
import {FrameEnv} from 'viewport/main';
import {Marker, MarkerType} from 'viewport/marker';
import {
  updateMarker as updateMarker_Move,
  getMarkerRadius as getMarkerRadius_Move
} from './move/updateMarker';
import {updateMarker as updateMarker_Rot} from './rotate/updateMarker';
import {GizmoType, AXIS_COLORS} from './index';
// yep, 20 lines of imports.


export interface GizmoDrawOpts {
  size: number;
  gizmoType: GizmoType;
  origin: Marker; // need whole marker for rotation
  forceDrawMarkers: boolean;
  allowedAxis: Axis[];
  isDragging: boolean;
}

// TODO depending on the camera position, move the gizmo points into positive/negative direction

const ANGLE_90_DGR = toRadians(90);

const getMesh = (frameEnv: FrameEnv, type: GizmoType) => {
  const meta = frameEnv.scene.gizmoMeta;
  switch (type) {
    case GizmoType.Move:   return meta.moveMesh;
    case GizmoType.Rotate: return meta.rotateMesh;
    case GizmoType.Scale:  return meta.moveMesh;
  }
};

const getShader = (frameEnv: FrameEnv) => frameEnv.scene.gizmoMeta.shader;

/** each axis needs to rotate gizmo mesh to show X, Y, Z */
const getAxisMatrix = (axis: Axis) => {
  switch (axis) {
    case Axis.AxisX:
      return fromZRotation(mat4_Create(), ANGLE_90_DGR);
    case Axis.AxisY:
      return mat4_Create(); // identity
    case Axis.AxisZ:
      return fromXRotation(mat4_Create(), -ANGLE_90_DGR);
  }
};

/**
 * get bone matrix for current frame
 * It gives us correct position + rotation, just a couple things to fix later
 * (it can get funny if boneMat has scale build-in. oh, well!)
 */
const getBoneMatrix = (marker: Marker) => {
  const bone = marker.owner as Bone;
  const boneMat = bone.$_frameCache;
  const {bindMatrix} = bone.data;
  return multiply(mat4_Create(), boneMat, bindMatrix);
};

const getModelMatrix = (axis: Axis, frameEnv: FrameEnv, opts: GizmoDrawOpts) => {
  // NOTE: don't try to read this function, just assume it is correct.
  //       There is limited number of permutations for matrix multiply order,
  //       I just tried them all to see which one is correct.
  //       I don't have to know the order by heart, I just have to know
  //       that there exist an order that gives me what I want.

  // matrix 1: rotate on per-axis basis
  const axisRotationMatrix = getAxisMatrix(axis);

  // matrix 2: scale as requested by UI
  const scaleMatrix = fromScaling(mat4_Create(), vec3_Create(opts.size, opts.size, opts.size));

  // matrix 3: bone matrix
  const boneMatrix = getBoneMatrix(opts.origin);

  // combine
  const m = multiply(mat4_Create(), boneMatrix, axisRotationMatrix);
  return multiply(mat4_Create(), m, scaleMatrix);
};

const updateMarker = (axis: Axis, frameEnv: FrameEnv, opts: GizmoDrawOpts, mvp: mat4, modelMatrix: mat4) => {
  const {scene, glState} = frameEnv;

  switch (opts.gizmoType) {
    case GizmoType.Move:
    case GizmoType.Scale: {
      const markerPos = updateMarker_Move(mvp, modelMatrix);
      const marker = scene.updateMarker(axis, markerPos);
      marker.radius = getMarkerRadius_Move(glState, mvp, opts.origin);
      break;
    }
    case GizmoType.Rotate: {
      const markerPos = updateMarker_Rot(scene, mvp, modelMatrix);
      scene.updateMarker(axis, markerPos);
      break;
    }
  }
};

const getAxisStatus = (opts: GizmoDrawOpts, axis: Axis, isDragging: boolean) => {
  const {allowedAxis, gizmoType} = opts;
  const isAxisDraggable = allowedAxis.indexOf(axis) !== -1;
  const markerVisible = !isDragging && isAxisDraggable && gizmoType === GizmoType.Rotate;
  return { isAxisDraggable, markerVisible, };
};

export const drawGizmo = (frameEnv: FrameEnv, opts: GizmoDrawOpts) => {
  if (opts.origin.type !== MarkerType.Bone) {
    throw `Could not draw gizmo at unsupported origin (expected MarkerType.Bone)`;
  }

  const {gizmoType, forceDrawMarkers, isDragging} = opts;
  const {scene, glState: {gl}} = frameEnv;

  const dp = new DrawParameters();
  dp.depth.write = false;
  dp.depth.test = DepthTest.AlwaysPass;
  dp.culling = CullingMode.None;
  frameEnv.glState.setDrawState(dp);

  const shader = getShader(frameEnv);
  const {vao, indexBuffer, indexGlType, triangleCnt} = getMesh(frameEnv, gizmoType);

  shader.use(gl);
  vao.bind(gl);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  AxisList.forEach((axis: Axis) => {
    const {isAxisDraggable, markerVisible} = getAxisStatus(opts, axis, isDragging);
    const marker = scene.getMarker(axis);
    marker.clickable = isAxisDraggable;
    marker.visible = markerVisible || forceDrawMarkers;
    if (!isAxisDraggable) { // no reason to draw inactive axis
      return;
    }

    const modelMatrix = getModelMatrix(axis, frameEnv, opts);
    const mvp = scene.getMVP(modelMatrix);

    setUniforms(gl, getShader(frameEnv), {
      'g_Color': AXIS_COLORS[axis],
      'g_MVP': mvp,
    }, true);
    gl.drawElements(gl.TRIANGLES, triangleCnt * 3, indexGlType, 0);

    updateMarker(axis, frameEnv, opts, mvp, modelMatrix);
  });
};
