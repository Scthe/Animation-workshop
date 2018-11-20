import {Scene} from 'viewport/scene';
import {GlState} from 'viewport/GlState';
import {GizmoType} from 'viewport/gizmo';
import {Marker, MarkerType} from 'viewport/marker';
import {getSelectedObject} from 'viewport/main';
import {uiBridge, appStateSetter} from 'state';
import {resetTransform} from 'gl-utils';

import {MouseHandler, MouseDragEvent} from './MouseHandler';
import {applyGizmoMove} from './handler.move';
import {applyGizmoRotate} from './handler.rotate';
import {setCursor, GizmoHandleDragEvent} from './utils';


// exports:
export {MouseDragEvent} from './MouseHandler';


/// mouse drag handling
/// NOTE: transform deltas are not cumulative: set, not add!

const CURSOR_MOVE = 'move';
const CURSOR_ROTATE = 'ew-resize';
const CURSOR_DEFAULT = 'default';

const onMarkerClicked = (glState: GlState) => (marker: Marker) => {
  const {draggingStatus} = glState;

  switch (marker.type) {

    // when new object was selected
    case MarkerType.Bone:
      draggingStatus.draggedAxis = undefined;
      uiBridge.setOnUI(appStateSetter('selectedObjectName', marker.name));
      break;

    // when starting dragging gizmo to move/rotate bone
    case MarkerType.Gizmo:
      draggingStatus.draggedAxis = marker.owner as any;
      resetTransform(draggingStatus.temporaryDisplacement);
      break;
  }
};


const createDragEvent = (glState: GlState, scene: Scene, mouseEvent: MouseDragEvent) => {
  const {draggedAxis} = glState.draggingStatus;
  const [width, height] = glState.getViewport();
  const {selectedMarker} = getSelectedObject(scene);

  return {
    mouseEvent,
    axis: draggedAxis,
    selectedMarker,
    scene,
    viewport: {width, height},
  };
};

const onMarkerDragged = (glState: GlState, scene: Scene) => (mouseEvent: MouseDragEvent) => {
  const {draggedAxis, draggedGizmo, temporaryDisplacement} = glState.draggingStatus;
  const dragEvent: GizmoHandleDragEvent = createDragEvent(glState, scene, mouseEvent);

  if (!dragEvent.selectedMarker || draggedAxis === undefined) {
    return;
  }

  switch (draggedGizmo) {
    case GizmoType.Move:
      const deltaMove = applyGizmoMove(dragEvent);
      temporaryDisplacement.position = deltaMove;

      setCursor(CURSOR_MOVE);
      break;

    case GizmoType.Rotate:
      const deltaRotateQuat = applyGizmoRotate(dragEvent);
      temporaryDisplacement.rotation = deltaRotateQuat;

      setCursor(CURSOR_ROTATE);
      break;
  }
};


const onMarkerUnclicked = (glState: GlState) => () => {
  const {draggingStatus} = glState;

  if (glState.isDragging()) {
    draggingStatus.draggedAxis = undefined;
    resetTransform(draggingStatus.temporaryDisplacement);
  }
  setCursor(CURSOR_DEFAULT);
};


//////////
/// Some init stuff
//////////

let mouseHandler: MouseHandler = undefined;

export const initHandlers = (canvas: HTMLCanvasElement, glState: GlState, scene: Scene) => {
  mouseHandler = new MouseHandler(canvas, glState, scene);
  mouseHandler.setOnMarkerClicked(onMarkerClicked(glState));
  mouseHandler.setOnMarkerDragged(onMarkerDragged(glState, scene));
  mouseHandler.setOnMarkerUnclicked(onMarkerUnclicked(glState));
};
