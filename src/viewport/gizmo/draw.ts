import {fromValues as vec3_Create} from 'gl-vec3';
import {
  mat4, create as mat4_Create, multiply,
  fromScaling, fromXRotation, fromZRotation,
} from 'gl-mat4';
import {
  Axis, AxisList, toRadians, transformPointByMat4,
  setUniforms, DrawParameters, DepthTest, CullingMode
} from 'gl-utils';

import {Bone} from 'viewport/armature';
import {FrameEnv} from 'viewport/main';
import {Marker, MarkerType} from 'viewport/marker';
import {GizmoType, AXIS_COLORS, GIZMO_MOVE_TIP, GIZMO_MOVE_RADIUS} from './index';
import {isAxisAllowed} from 'viewport/scene';
import {getGizmoDrawModelMatrix} from './tfxSpace';

import {calcDraggableHandlePos as calcDraggableHandlePos_Rot} from './rotate/calcDraggableHandlePos';
// yep, 20 lines of imports.


export interface GizmoDrawOpts {
  size: number;
  gizmoType: GizmoType;
  origin: Marker; // need whole marker for rotation
  forceDrawMarkers: boolean;
  isDragging: boolean;
}

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
  // It gives us correct position + rotation, just a couple things to fix later
  // (it can get funny if boneMat has scale build-in. oh, well!)
  //
  // Explanation (TODO verify, don't remember ATM):
  // inverseBindMatrix moves bone from world space (e.g. shoulder position)
  // to (0,0,0). Bind matrix does reverse, so it takes gizmo at (0,0,0)
  // and moves it to bind WS position (e.g. shoulder position)
  const bone = opts.origin.owner as Bone;
  const boneMatrix = getGizmoDrawModelMatrix(bone);

  // combine
  const m = multiply(mat4_Create(), boneMatrix, axisRotationMatrix);
  return multiply(mat4_Create(), m, scaleMatrix);
};

const updateMarker = (axis: Axis, frameEnv: FrameEnv, opts: GizmoDrawOpts, modelMatrix: mat4) => {
  const {scene} = frameEnv;
  const marker = scene.getMarker(axis);

  switch (opts.gizmoType) {
    case GizmoType.Move:
    case GizmoType.Scale: {
      /// Move gizmo uses weird shape - arrow. Implmenting picking requires
      /// some special code.
      ///
      /// Basically, we are going to place circular markers at the end of the arrows.
      /// When the marker is clicked, the move translation will occur (after drag)
      marker.$position3d = transformPointByMat4(GIZMO_MOVE_TIP, modelMatrix, true);
      marker.radius = GIZMO_MOVE_RADIUS * opts.size;
      break;
    }
    case GizmoType.Rotate: {
      const cameraPos = scene.camera.getPosition();
      marker.$position3d = calcDraggableHandlePos_Rot(modelMatrix, cameraPos);
      break;
    }
  }
};

const getAxisStatus = (frameEnv: FrameEnv, gizmoType: GizmoType, axis: Axis, isDragging: boolean) => {
  const isAxisDraggable = isAxisAllowed(axis, gizmoType, frameEnv.selectedObjectCfg.constraints);
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
    const {isAxisDraggable, markerVisible} = getAxisStatus(frameEnv, opts.gizmoType, axis, isDragging);
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

    updateMarker(axis, frameEnv, opts, modelMatrix);
  });
};
