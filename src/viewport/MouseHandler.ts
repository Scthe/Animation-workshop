import {GlState} from './GlState';
import {Marker, MarkerType} from './structs';
import {setSelectedObject, addMoveToSelectedObject} from '../UI_State';
import {getMarkerRadius} from './drawMarkers';
import {GizmoAxis} from './drawGizmos';
import {NDCtoPixels} from '../gl-utils';


const MOUSE_LEFT_BTN = 0; // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button

// based on last left click
enum ClickedState {
  NotClicked, Camera,
  Object, // some general object, do nothing on MOUSE_MOVE etc.
  MoveGizmo,
}

const setVec = (vec: number[], x: number, y: number) => {
  vec[0] = x;
  vec[1] = y;
};

export class MouseHandler {

  private clickedState = ClickedState.NotClicked;
  private lastPosition = [0, 0]; // since last MOUSE_MOVE
  private firstClick = [0, 0]; // click position that started MOUSE_MOVE
  private gizmoAxis = GizmoAxis.AxisX; // if clicked axis

  constructor (
    private readonly canvas: HTMLCanvasElement,
    private readonly glState: GlState
  ) {
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);

    this.canvas.addEventListener('mousedown', this.onMouseDown, false);
    this.canvas.addEventListener('mousemove', this.onMouseMove, false);
    this.canvas.addEventListener('mouseup', this.onMouseUp, false);
  }

  private onMouseDown (event: MouseEvent ) {
    const x = event.pageX;
    const y = event.pageY;

    if (event.button === MOUSE_LEFT_BTN) {
      setVec(this.firstClick, x, y);
      const clickedMarker = this.objectPick(x, y);
      if (!clickedMarker) {
        this.clickedState = ClickedState.Camera;
      } else {
        this.onMarkerClicked(clickedMarker);
      }
    }

    setVec(this.lastPosition, x, y);
  }

  private objectPick (clickX: number, clickY: number) {
    const markers = this.glState.getMarkers(m => true);
    const {width, height} = this.glState.getViewport();
    // console.log(`Clicked (${clickX}, ${clickY})`);

    const wasClicked = (marker: Marker, i: number) => {
      const {positionNDC} = marker.position;
      const radius = getMarkerRadius(marker);
      const [posX, posY] = NDCtoPixels(positionNDC, width, height, true);
      const delta = [clickX - posX, clickY - posY];
      const dist2 = delta[0] * delta[0] + delta[1] * delta[1];
      // console.log(`Marker[${i}] (x=${posX}, y=${posY}) dist: ${Math.sqrt(dist2)}`);
      return dist2 < (radius * radius);
    };

    return markers.filter(wasClicked)[0];
  }

  private onMarkerClicked (marker: Marker) {
    console.log(`Clicked marker: `, marker);

    switch (marker.type) {
      case MarkerType.GizmoMove:
        this.clickedState = ClickedState.MoveGizmo;
        switch (marker.name) {
          case GizmoAxis[GizmoAxis.AxisX]: this.gizmoAxis = GizmoAxis.AxisX; break;
          case GizmoAxis[GizmoAxis.AxisY]: this.gizmoAxis = GizmoAxis.AxisY; break;
          case GizmoAxis[GizmoAxis.AxisZ]: this.gizmoAxis = GizmoAxis.AxisZ; break;
        }
        break;

      case MarkerType.Armature:
      case MarkerType.Object:
      default:
        this.clickedState = ClickedState.Object;
        setSelectedObject(marker);
        break;
    }
  }

  private onMouseUp (event: MouseEvent ) {
    this.clickedState = ClickedState.NotClicked;
  }

  private onMouseMove (event: MouseEvent) {
    // get this out of the way
    if (this.clickedState === ClickedState.NotClicked) { return; }

    const delta = this.calculateMoveDelta(event);

    switch (this.clickedState) {
      case ClickedState.Camera: {
        this.glState.camera.onMouseMove(delta);
        break;
      }

      case ClickedState.MoveGizmo: {
        console.log(`DRAG MoveX`);
        const speed = delta[0] / 200;
        const moveVector = [speed, 0, 0];
        addMoveToSelectedObject(moveVector);
        break;
      }

      default: break;
    }
  }

  private calculateMoveDelta (event: MouseEvent) {
    const x = event.pageX;
    const y = event.pageY;
    let mouseDelta = [
      x - this.lastPosition[0],
      y - this.lastPosition[1] ];
    setVec(this.lastPosition, x, y);
    return mouseDelta;
  }

}
