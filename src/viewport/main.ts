import {requestAnimFrame, handleResize} from 'gl-utils';

import {GlState} from './GlState';
import {drawObject3d} from './drawObject3d';
import {drawGizmo, GizmoType} from './gizmo';
import {Marker, MarkerType, drawMarkers} from './marker';
import {calculateBoneMatrices, updateArmatureMarkers} from './armature';
import {Scene, createScene} from './scene';
import {MouseHandler, MouseDragEvent} from './MouseHandler';
import {applyGizmoMove, applyGizmoRotate} from './gizmo';

const CAMERA_MOVE_SPEED = 0.005; // depends on scale etc.
const CAMERA_ROTATE_SPEED = 0.025 / 6;

// refactor:
// TODO unify API (always take FrameEnv etc.)
// TODO move AnimState to /animation
// TODO move 'show debug markers' to 'Dsiplay' seciton
// TODO color selected object

// gizmo:
// TODO gizmo/updateMarker should return MarkerPosition[], so color and radius can be set for both Move/Rotate
// TODO display only correct axis in gizmo

// TODO final glb
// TODO connect ui with viewport (drawMarkers, gizmo/marker size etc.)
// TODO connect config with viewport



//////////
/// Anim state
//////////

/** Animation timing etc. */
export interface AnimState {
  deltaTime: number; // previous -> this frame
  // animationFrameId: number; // frame to render, used for interpolation etc.
  frameId: number; // id of current frame

  // fromAnimStartMs: number
  // fromAnimStartFrame: number
}

const createAnimState = ((timeOld: number, frameId: number) => (time: number) => {
  const animState = {
    deltaTime: time - timeOld,
    frameId,
  };
  timeOld = time;
  ++frameId;

  return animState;
})(0, 0);



//////////
/// Per frame update
//////////

export interface FrameEnv {
  timing: AnimState;
  glState: GlState;
  scene: Scene;
}



const viewportUpdate = (time: number, glState: GlState, scene: Scene) => {
  const {gl, pressedKeys} = glState;
  const {camera, lamp} = scene;

  const frameEnv = {
    timing: createAnimState(time),
    glState,
    scene,
  };

  camera.update(frameEnv.timing.deltaTime, CAMERA_MOVE_SPEED, CAMERA_ROTATE_SPEED, pressedKeys);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  const [width, height] = glState.getViewport();
  gl.viewport(0.0, 0.0, width, height);

  calculateBoneMatrices(frameEnv.timing, lamp.bones);
  drawObject3d(frameEnv, scene.lamp);

  const {currentObject: objName, draggedGizmo} = glState.selection;
  const currentObject = scene.getMarker(objName);
  if (currentObject) {
    drawGizmo(frameEnv, {
      type: draggedGizmo,
      size: 0.5,
      origin: currentObject,
    });
  }

  // markers
  updateArmatureMarkers(scene, lamp);
  drawMarkers(frameEnv); // TODO set some gizmo markers as invisible
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
      glState.selection.currentObject = marker.name;
      glState.selection.draggedAxis = undefined;
      break;
    case MarkerType.Gizmo:
      glState.selection.draggedAxis = marker.owner as any;
      break;
  }
};

const onMarkerDragged = (ev: MouseDragEvent) => {
  const {currentObject: objName, draggedAxis, draggedGizmo} = glState.selection;
  // const currentObject = scene.getMarker(objName);
  if (!objName || draggedAxis === undefined) { return; }

  switch (draggedGizmo) {
    case GizmoType.Move:
      applyGizmoMove(objName, ev, draggedAxis);
      break;
    case GizmoType.Rotate:
      applyGizmoRotate(objName, ev, draggedAxis);
      break;
  }
};

const onMarkerUnclicked = () => {
  // console.log(`Unclicked axis: ${glState.selection.draggedAxis}`);
  if (glState.isDragging()) {
    glState.selection.draggedAxis = undefined;
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
