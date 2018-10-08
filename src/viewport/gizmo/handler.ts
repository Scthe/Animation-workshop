import {vec2} from 'gl-vec2';
import {
  vec3, create as vec3_0, fromValues as vec3_Create,
  subtract, scale, dot
} from 'gl-vec3';
// import {fromMat4} from 'gl-mat3';
import {mat4, create as mat4_Create} from 'gl-mat4';
import {create as quat_Create, rotationTo} from 'gl-quat';
import {subtractNorm, Axis} from 'gl-utils';
import {
  generateRayFromCamera,
  createPlaneAroundAxisAndTowardCamera,
  planeRayIntersection,
  Plane,
  getPointFromRay,
} from 'gl-utils/raycast';
import {addMove, addRotation} from '../../UI_Bridge';
import {FrameEnv} from 'viewport/main';
import {Marker} from 'viewport/marker';
import {GizmoAxisDragEvent} from './index';
// import {getAxisMatrix} from 'viewport/gizmo';

// TODO or maybe just unproject vec4(pxX, pxY, dist(camera, marker), 1) for view space points?
// TODO glState.tmpKeyframe too? and whole keyframe system
// TODO compare wrong mappings with blender


const generateRay = (frameEnv: FrameEnv, mousePosPx: vec2) => {
  const {glState, scene} = frameEnv;
  const [width, height] = glState.getViewport();

  const cameraDesc = {
    viewport: {width, height},
    viewProjMat: scene.getMVP(mat4_Create()),
  };

  return generateRayFromCamera(cameraDesc, mousePosPx);
};

const projectClickOntoPlane = (frameEnv: FrameEnv, plane: Plane, posPx: vec2) => {
  const ray = generateRay(frameEnv, posPx);
  return planeRayIntersection(plane, ray);
};



////////////////////
// DEBUG
////////////////////

// const d2 = (a: number) => Number(a).toFixed(3);
// const to_str = (v: vec3) => `[${d2(v[0])}, ${d2(v[1])}, ${d2(v[2])}]`;

const fillWithDebugMarkers = (vpMat: mat4, markers: Marker[], axisDir: vec3, point: vec3) => {
  const SPACING = 0.2;
  const ray = {origin: point, dir: axisDir};

  markers.forEach((m: Marker, i: number) => {
    m.$_framePosition.position3d = getPointFromRay(ray, (i - markers.length / 2) * SPACING);
  });
};

const projectOntoAxis = (vec: vec3, axis: vec3) => {
  return scale(vec3_0(), axis, dot(vec, axis)); // TODO handle 180dgr
};



//////////////
/// Move
//////////////


/*
const getRotationAxes = (selectedObject: any) => {
  const bone = selectedObject.owner as any;
  const boneMat = bone.getFrameMatrix(); // bone.$_frameCache;
  const boneRot = fromMat4(mat4_Create(), boneMat);

  const axes = getAxesFromRotMatrix(boneRot);

  // console.log([
    // 'x ' + to_str(axes[0]),
    // 'y ' + to_str(axes[1]),
    // 'z ' + to_str(axes[2]),
  // ].join(', '));

  return axes;
};*/

/*const getRotationAxis2 = (selectedObject: any, axis: Axis) => {
  const bone = selectedObject.owner as any;
  const boneMatrix = bone.getFrameMatrix();
  const axisRotationMatrix = getAxisMatrix(axis);
  const modelMatrix = multiply(mat4_Create(), boneMatrix, axisRotationMatrix);

  // const vRaw = getAxisVector(axis) as vec3;
  // const axisVec = transformPointByMat4(vec3_0(), vRaw, boneMat);
  // return normalize(vec3_0(), axisVec);
};*/

const getRotationAxis3 = (scene: any, objPos: vec3,  axis: Axis) => {
  const gizmoMarker = scene.gizmoMeta.markers[axis];
  const markerPos = gizmoMarker.$_framePosition.position3d;
  return subtractNorm(markerPos, objPos);
};

export const applyGizmoMove = (frameEnv: FrameEnv, ev: GizmoAxisDragEvent) => {
  const {mouseEvent, axis} = ev;
  const {selectedObject, scene: {camera}} = frameEnv;
  const objPosition = selectedObject.$_framePosition.position3d;

  // create plane to project clicked 3d points onto
  // const axisVec = vec3_Create(1, 0, 0); // axis X
  // const axisVec = getRotationAxes(selectedObject)[axis];
  // const axisVec = getRotationAxis(selectedObject, axis);
  const axisVec = getRotationAxis3(frameEnv.scene, objPosition, axis);
  const plane = createPlaneAroundAxisAndTowardCamera(axisVec, objPosition, camera.getPosition());
  // console.log(to_str(axisVec));

  const vp = frameEnv.scene.getMVP(mat4_Create());
  const debug = frameEnv.scene.debugMarkers;
  fillWithDebugMarkers(vp, debug.axis, axisVec, objPosition);

  // do the projection
  const p0_onPlane   = projectClickOntoPlane(frameEnv, plane, mouseEvent.firstClick);
  const pNow_onPlane = projectClickOntoPlane(frameEnv, plane, mouseEvent.position);
  // both markers are somewhere on the plane, project onto axis
  const p0   = projectOntoAxis(p0_onPlane, axisVec);
  const pNow = projectOntoAxis(pNow_onPlane, axisVec);
  debug.dragStart.$_framePosition.position3d = p0;
  debug.dragNowOnPlane.$_framePosition.position3d = pNow_onPlane;
  debug.dragNow.$_framePosition.position3d = pNow;

  const delta = subtract(vec3_0(), pNow, p0);
  // const dist = multiply(vec3_0(), axisVec, delta);

  // TODO take delta.length * axisVector? e.g. `0.3*[1,0,0]` ?
  // const t = distance(p0, pNow); // we have distance, we need direction (or whatever it is called in eng.)
  // const dist = scale(vec3_0(), axisVec, t);
  // const moveDir = delta[0] * axisVec[0] > 0 ? 1 : -1; // TODO fix for all axis
  // const moveDir = Math.sign(dot(axisVec, delta));
  // const t = moveDir * length(delta);
  // const dist = scale(vec3_0(), axisVec, t);


  const dist = delta;
  // console.log(`delta= ${to_str(delta)}, t= ${t}`);

  // NOTE: move is not cumulative! set, not add!
  addMove(selectedObject.name, dist);
};

//////////////
/// Rotate
//////////////

/*const toHumanAngle = (a: vec3, b: vec3) => {
  const dd = dot(a, b); // TODO handle negative angles, tho this is just print only..
  const angleRad = Math.acos(dd);
  return angleRad * 180 / Math.PI;
};*/

/*
const norm = (vec: vec3) => {
  return normalize(vec3_Create(0, 0, 0), vec);
};

const CIRCLE_QUATERS_POINTS = [
  norm(vec3_Create( 1, 0,  1)),
  norm(vec3_Create(-1, 0,  1)),
];

const getRotationAxis2 = (selectedObject: any, axis: Axis) => {
  const bone = selectedObject.owner as any;
  const boneMatrix = bone.getFrameMatrix();
  const axisRotationMatrix = getAxisMatrix(axis);
  const modelMatrix = multiply(mat4_Create(), boneMatrix, axisRotationMatrix);

  const a1 = transformPointByMat4(vec3_0(), CIRCLE_QUATERS_POINTS[0], modelMatrix);
  const a2 = transformPointByMat4(vec3_0(), CIRCLE_QUATERS_POINTS[1], modelMatrix);
  return cross(vec3_0(), a1, a2);
  // const vRaw = getAxisVector(axis) as vec3;
  // const axisVec = transformPointByMat4(vec3_0(), vRaw, boneMat);
  // return normalize(vec3_0(), axisVec);
};*/

export const applyGizmoRotate = (frameEnv: FrameEnv, ev: GizmoAxisDragEvent) => {
  const {mouseEvent} = ev;
  const {selectedObject} = frameEnv;
  const objPosition = selectedObject.$_framePosition.position3d;
  // NOTE: rotation axis is same as move axis == plane axis

  // create plane to project clicked 3d poits onto
  // const axisVec = vec3_Create(1, 0, 0); // axis X
  // const plane = createPlaneAroundAxisAndTowardCamera(axisVec, objPosition, camera.getPosition());
  /*const axisVec = getRotationAxis2(selectedObject, axis);
  const vp = frameEnv.scene.getMVP(mat4_Create());
  const debug = frameEnv.scene.debugMarkers;
  fillWithDebugMarkers(vp, debug.axis, axisVec, objPosition);

  const plane = {
    normal: axisVec,
    d: getPlane_d(axisVec, objPosition),
  };*/
  const plane = {
    normal: vec3_Create(0, 0, -1),
    d: 0,
  };

  // do the projection
  const p0   = projectClickOntoPlane(frameEnv, plane, mouseEvent.firstClick);
  const pNow = projectClickOntoPlane(frameEnv, plane, mouseEvent.position);

  // calculate vectors: objectCenter->orgClick and objectCenter->nowClick
  const a = subtractNorm(p0, objPosition);
  const b = subtractNorm(pNow, objPosition);
  // console.log(`angle=${toHumanAngle(a, b)}`);

  // get quat between vectorOrg and vectorNow
  const qRotate = rotationTo(quat_Create(), a, b); // NOTE: rotate is not cumulative! set, not add!
  addRotation(selectedObject.name, qRotate);
};
