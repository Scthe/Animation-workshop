import {vec2, fromValues as vec2_Create} from 'gl-vec2';
import {GlState} from './GlState';
import {Marker, getMarkerAt} from './marker';
import {Scene} from 'viewport/scene';


const MOUSE_LEFT_BTN = 0; // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button

// based on last left-btn click
enum ClickedState {
  NotClicked, Camera, Marker
}

export interface MouseDragEvent {
  firstClick: vec2; // click that initiated draw
  position: vec2; // current mouse xy
  delta: vec2; // change since last emited event
  totalDelta: vec2; // change since original click
}

const getXYfromMouseEv = (event: MouseEvent) => vec2_Create(event.pageX, event.pageY);

const subtract = (a: vec2, b: vec2) => vec2_Create( // i have gl-vec2 syntax
  a[0] - b[0],
  a[1] - b[1]
);

type ClickHandler = (m: Marker) => void;
type DragHandler = (ev: MouseDragEvent) => void;
type UnclickHandler = () => void;


export class MouseHandler {

  private clickedState = ClickedState.NotClicked;
  private lastPosition = vec2_Create(0, 0); // since last MOUSE_MOVE
  private firstClick = vec2_Create(0, 0); // click position that started MOUSE_MOVE
  private onMarkerClickedHandler?: ClickHandler;
  private onMarkerDraggedHandler?: DragHandler;
  private onMarkerUnclickedHandler?: UnclickHandler;

  constructor (
    element: HTMLElement,
    private glState: GlState,
    private scene: Scene,
  ) {
    element.addEventListener('mousedown', this.onMouseDown, false);
    element.addEventListener('mousemove', this.onMouseMove, false);
    element.addEventListener('mouseup', this.onMouseUp, false);
    element.addEventListener('mouseleave', this.stopDragging, false);
  }

  public setOnMarkerClicked(cb: ClickHandler) {
    this.onMarkerClickedHandler = cb;
  }

  public setOnMarkerDragged(cb: DragHandler) {
    this.onMarkerDraggedHandler = cb;
  }

  public setOnMarkerUnclicked(cb: UnclickHandler) {
    this.onMarkerUnclickedHandler = cb;
  }

  private stopDragging = () => {
    if (this.clickedState === ClickedState.Marker) {
      if (this.onMarkerUnclickedHandler) {
        this.onMarkerUnclickedHandler();
      }
    }

    this.clickedState = ClickedState.NotClicked;
  }

  private onMouseDown = (event: MouseEvent) => {
    if (event.button !== MOUSE_LEFT_BTN) { return; }

    const click_XY = getXYfromMouseEv(event);
    this.firstClick = click_XY;
    this.lastPosition = click_XY;

    const {glState, scene} = this;
    const clickedMarker = getMarkerAt(glState.getViewport(), scene.getMarkers(), click_XY);

    if (clickedMarker) {
      this.clickedState = ClickedState.Marker;
      if (this.onMarkerClickedHandler) {
        this.onMarkerClickedHandler(clickedMarker);
      }

    } else {
      this.clickedState = ClickedState.Camera;
    }
  }

  private onMouseUp = (event: MouseEvent ) => {
    if (event.button !== MOUSE_LEFT_BTN) { return; }

    this.stopDragging();
  }

  private onMouseMove = (event: MouseEvent) => {
    const ev = this.createDragEvent(event);

    switch (this.clickedState) {
      case ClickedState.Camera: {
        this.scene.camera.onMouseMove(ev);
        break;
      }

      case ClickedState.Marker: {
        if (this.onMarkerDraggedHandler) {
          this.onMarkerDraggedHandler(ev);
        }
        break;
      }

      case ClickedState.NotClicked:
      default:
        break;
    }
  }

  private createDragEvent = (event: MouseEvent) => {
    const position = getXYfromMouseEv(event);
    const delta = subtract(position, this.lastPosition);
    this.lastPosition = position;

    return {
      firstClick: this.firstClick,
      position,
      delta,
      totalDelta: subtract(position, this.firstClick),
    } as MouseDragEvent;
  }

}
