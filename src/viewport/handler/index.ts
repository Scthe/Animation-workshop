import {Scene} from 'viewport/scene';
import {GlState} from 'viewport/GlState';
import {GizmoType} from 'viewport/gizmo';
import {Marker, MarkerType} from 'viewport/marker';
import {getSelectedObject} from 'viewport/main';
import {uiBridge, appStateSetter} from '../../UI_Bridge';

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
      break;
  }
};


const onMarkerDragged = (glState: GlState, scene: Scene) => (mouseEvent: MouseDragEvent) => {
  const {draggedAxis, draggedGizmo} = glState.draggingStatus;
  const [width, height] = glState.getViewport();
  const {selectedMarker} = getSelectedObject(scene);

  const dragEvent = {
    mouseEvent,
    axis: draggedAxis,
    selectedMarker,
    scene,
    viewport: {width, height},
  } as GizmoHandleDragEvent;

  if (!dragEvent.selectedMarker || draggedAxis === undefined) {
    return;
  }

  switch (draggedGizmo) {
    case GizmoType.Move:
      applyGizmoMove(dragEvent);
      setCursor(CURSOR_MOVE);
      break;
    case GizmoType.Rotate:
      applyGizmoRotate(dragEvent);
      setCursor(CURSOR_ROTATE);
      break;
  }
};


const onMarkerUnclicked = (glState: GlState) => () => {
  if (glState.isDragging()) {
    glState.draggingStatus.draggedAxis = undefined;
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
