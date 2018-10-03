import {requestAnimFrame, handleResize} from 'gl-utils';

import {GlState} from './GlState';
import {drawObject3d} from './drawObject3d';
import {drawGizmo, GizmoType} from './gizmo';
import {Marker, MarkerType, drawMarkers} from './marker';
import {calculateBoneMatrices, updateArmatureMarkers} from './armature';
import {Scene, createScene, BoneConfigEntry, getBoneConfig} from './scene';
import {MouseHandler, MouseDragEvent} from './MouseHandler';
import {applyGizmoMove, applyGizmoRotate} from './gizmo';
import {AnimTimings, createAnimTimings} from './animation';
import {uiBridge, appStateGetter, appStateSetter} from '../UI_Bridge';

const CAMERA_MOVE_SPEED = 0.005; // depends on scale etc.
const CAMERA_ROTATE_SPEED = 0.025 / 6;


// TODO fix gizmo/handlers
// TODO final glb
// TODO gizmo should always draw on top. use stencil?


//////////
/// Per frame update
//////////

export interface FrameEnv {
  timing: AnimTimings;
  glState: GlState;
  scene: Scene;
  selectedObject: Marker;
  selectedObjectCfg: BoneConfigEntry;
}

const resetGizmoMarkers = (scene: Scene) => {
  scene.gizmoMeta.markers.forEach(m => {
    m.visible = false;
    m.clickable = false;
  });
};

const createGizmoDrawOpts = (frameEnv: FrameEnv) => {
  const {glState, selectedObject} = frameEnv;
  const {draggedGizmo} = glState.draggingStatus;

  const {gizmoSize, showDebug} = uiBridge.getFromUI(
    appStateGetter('gizmoSize', 'showDebug')
  );
  const isDragging = glState.isDragging();

  return selectedObject ? {
    size: gizmoSize / 100, // just go with it..
    gizmoType: draggedGizmo,
    origin: selectedObject,
    forceDrawMarkers: showDebug,
    isDragging,
  } : undefined;
};

const tryChangeGizmo = (glState: GlState, scene: Scene) => {
  if (glState.isDragging()) { // can't change midway
    return;
  }

  const {draggingStatus} = glState;
  const {currentGizmo} = uiBridge.getFromUI(
    appStateGetter('currentGizmo')
  );
  if (draggingStatus.draggedGizmo !== currentGizmo) {
    draggingStatus.draggedGizmo = currentGizmo;
    scene.gizmoMeta.markers.forEach(m => m.radius = undefined);
  }
};

const getSelectedObject = (scene: Scene) => {
  const {selectedObject} = uiBridge.getFromUI(
    appStateGetter('selectedObject')
  );
  return {
    selectedObject: scene.getMarker(selectedObject as string),
    selectedObjectCfg: getBoneConfig(selectedObject as string),
  };
};

const viewportUpdate = (time: number, glState: GlState, scene: Scene) => {
  const {gl, pressedKeys} = glState;
  const {camera, lamp} = scene;

  const frameEnv = {
    timing: createAnimTimings(time),
    glState,
    scene,
    ...getSelectedObject(scene),
  } as FrameEnv; // typecheck this pls

  // camera
  const {cameraMoveSpeed, cameraRotateSpeed} = uiBridge.getFromUI(
    appStateGetter('cameraMoveSpeed', 'cameraRotateSpeed')
  );
  camera.update(
    frameEnv.timing.deltaTime,
    CAMERA_MOVE_SPEED * cameraMoveSpeed / 10, // just go with it..
    CAMERA_ROTATE_SPEED * cameraRotateSpeed / 10, // just go with it..
    pressedKeys
  );

  // clear + viewport
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  const [width, height] = glState.getViewport();
  gl.viewport(0.0, 0.0, width, height);

  // lamp: bones + draw
  calculateBoneMatrices(frameEnv.timing, lamp.bones);
  drawObject3d(frameEnv, scene.lamp);

  // gizmo
  tryChangeGizmo(glState, scene);
  const gizmoDrawOpts = createGizmoDrawOpts(frameEnv);
  if (gizmoDrawOpts) {
    drawGizmo(frameEnv, gizmoDrawOpts); // this also sets markers
  } else {
    resetGizmoMarkers(scene);
  }

  // markers
  updateArmatureMarkers(scene, lamp);
  const {markerSize} = uiBridge.getFromUI(
    appStateGetter('markerSize')
  );
  drawMarkers(frameEnv, markerSize / 10.0); // just go with it..
};

//////////
/// Some init stuff
//////////

let glState: GlState = undefined;
let scene: Scene = undefined;
let mouseHandler: MouseHandler = undefined;

const onMarkerClicked = (marker: Marker) => {
  // console.log(`Clicked marker '${marker.name}': `, marker);

  switch (marker.type) {
    case MarkerType.Bone:
      glState.draggingStatus.draggedAxis = undefined;
      uiBridge.setOnUI(appStateSetter('selectedObject', marker.name));
      break;
    case MarkerType.Gizmo:
      glState.draggingStatus.draggedAxis = marker.owner as any;
      break;
  }
};

const onMarkerDragged = (ev: MouseDragEvent) => {
  const {draggedAxis, draggedGizmo} = glState.draggingStatus;

  const {selectedObject} = uiBridge.getFromUI(
    appStateGetter('selectedObject')
  );

  if (!selectedObject || draggedAxis === undefined) { return; }

  switch (draggedGizmo) {
    case GizmoType.Move:
      applyGizmoMove(selectedObject, ev, draggedAxis);
      break;
    case GizmoType.Rotate:
      applyGizmoRotate(selectedObject, ev, draggedAxis);
      break;
  }
};

const onMarkerUnclicked = () => {
  // console.log(`Unclicked axis: ${glState.selection.draggedAxis}`);
  if (glState.isDragging()) {
    glState.draggingStatus.draggedAxis = undefined;
  }
};

export const init = async (canvas: HTMLCanvasElement) => {
  glState = new GlState();
  await glState.init(canvas);

  glState.gl.clearColor(0.5, 0.5, 0.5, 1.0);
  glState.gl.clearDepth(1.0);

  scene = await createScene(glState);

  mouseHandler = new MouseHandler(canvas, glState, scene);
  mouseHandler.setOnMarkerClicked(onMarkerClicked);
  mouseHandler.setOnMarkerDragged(onMarkerDragged);
  mouseHandler.setOnMarkerUnclicked(onMarkerUnclicked);

  const onDraw = (time: number) => {
    handleResize(glState.gl);
    viewportUpdate(time, glState, scene);
    requestAnimFrame(onDraw);
  };

  return onDraw;
};
