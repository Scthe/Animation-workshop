import {requestAnimFrame, handleResize} from 'gl-utils';

import {GlState} from './GlState';
import {drawObject3d} from './drawObject3d';
import {drawGizmo} from './gizmo';
import {Marker, drawMarkers} from './marker';
import {calculateBoneMatrices, updateArmatureMarkers} from './armature';
import {Scene, createScene, BoneConfigEntry, getBoneConfig} from './scene';
import {AnimTimings, createAnimTimings, interpolate} from './animation';
import {uiBridge, appStateGetter} from '../UI_Bridge';
import {initHandlers} from './handler';

const CAMERA_MOVE_SPEED = 0.005; // depends on scale etc.
const CAMERA_ROTATE_SPEED = 0.025 / 6;


// TODO gizmo should always draw on top. use stencil?
// TODO when looking behind, the markers are still visible


//////////
/// Per frame update
//////////

export interface FrameEnv {
  timing: AnimTimings;
  glState: GlState;
  scene: Scene;
  selectedMarker: Marker;
  selectedObjectCfg: BoneConfigEntry;
}

const resetGizmoMarkers = (scene: Scene) => {
  scene.gizmoMeta.markers.forEach(m => {
    m.visible = false;
    m.clickable = false;
  });
};

const createGizmoDrawOpts = (frameEnv: FrameEnv) => {
  const {glState, selectedMarker} = frameEnv;
  const {draggedGizmo} = glState.draggingStatus;

  const {gizmoSize, showDebug} = uiBridge.getFromUI(
    appStateGetter('gizmoSize', 'showDebug')
  );
  const isDragging = glState.isDragging();

  return selectedMarker ? {
    size: gizmoSize / 100, // just go with it..
    gizmoType: draggedGizmo,
    origin: selectedMarker,
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

export const getSelectedObject = (scene: Scene) => {
  const {selectedObjectName} = uiBridge.getFromUI(
    appStateGetter('selectedObjectName')
  );
  return {
    selectedMarker: scene.getMarker(selectedObjectName),
    selectedObjectCfg: getBoneConfig(selectedObjectName),
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
  const {cameraMoveSpeed, cameraRotateSpeed, selectedObjectName} = uiBridge.getFromUI(
    appStateGetter('cameraMoveSpeed', 'cameraRotateSpeed', 'selectedObjectName')
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
  const interpolateParams = { glState, selectedObjectName, };
  interpolate(interpolateParams, lamp.bones);
  calculateBoneMatrices(lamp.bones);
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
  scene.updateDebugMarkers();
  const {markerSize, showDebug} = uiBridge.getFromUI(
    appStateGetter('markerSize', 'showDebug')
  );
  drawMarkers(frameEnv, markerSize / 10.0, showDebug); // just go with it..
};

//////////
/// Some init stuff
//////////

let glState: GlState = undefined;
let scene: Scene = undefined;

export const init = async (canvas: HTMLCanvasElement) => {
  glState = new GlState();
  await glState.init(canvas);

  glState.gl.clearColor(0.5, 0.5, 0.5, 1.0);
  glState.gl.clearDepth(1.0);

  scene = await createScene(glState);

  initHandlers(canvas, glState, scene);

  const onDraw = (time: number) => {
    handleResize(glState.gl);
    viewportUpdate(time, glState, scene);
    requestAnimFrame(onDraw);
  };

  return onDraw;
};
