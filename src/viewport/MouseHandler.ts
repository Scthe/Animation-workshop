import {vec2, fromValues as vec2_Create} from 'gl-vec2';
import {GlState} from './GlState';
import {Marker, getMarkerAt} from './marker';
import {Scene} from 'viewport/scene';


const MOUSE_LEFT_BTN = 0; // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button

// based on last left click
enum ClickedState {
  NotClicked, Camera, Marker
}

export interface MouseDragEvent {
  firstClick: vec2; // click that initiated draw
  position: vec2; // current mouse xy
  delta: vec2; // change since last emited event
}

const setVec = (vec: vec2, x: number, y: number) => {
  vec[0] = x;
  vec[1] = y;
};

const getXYfromMouseEv = (event: MouseEvent) => {
  return [event.pageX, event.pageY];
};

type ClickHandler = (m: Marker) => void;
type DragHandler = (ev: MouseDragEvent) => void;


export class MouseHandler {

  private clickedState = ClickedState.NotClicked;
  private lastPosition = vec2_Create(0, 0); // since last MOUSE_MOVE
  private firstClick = vec2_Create(0, 0); // click position that started MOUSE_MOVE
  private onMarkerClickedHandler?: ClickHandler;
  private onMarkerDraggedHandler?: DragHandler;
  public scene: Scene;

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

  setOnMarkerClicked(cb: ClickHandler) { this.onMarkerClickedHandler = cb; }
  setOnMarkerDragged(cb: DragHandler) { this.onMarkerDraggedHandler = cb; }

  private onMouseDown (event: MouseEvent) {
    const [x, y] = getXYfromMouseEv(event);

    if (event.button === MOUSE_LEFT_BTN) {
      setVec(this.firstClick, x, y);

      const clickedMarker = getMarkerAt(this.glState, x, y);

      if (!clickedMarker) {
        this.clickedState = ClickedState.Camera;
      } else if (this.onMarkerClickedHandler) {
        this.clickedState = ClickedState.Marker;
        this.onMarkerClickedHandler(clickedMarker);
      }
    }

    setVec(this.lastPosition, x, y);
  }

  private onMouseUp (event: MouseEvent ) {
    this.clickedState = ClickedState.NotClicked;
  }

  private onMouseMove (event: MouseEvent) {
    const [x, y] = getXYfromMouseEv(event);
    const delta = this.calculateMoveDelta(event);
    const ev = {
      firstClick: this.firstClick,
      position: vec2_Create(x, y),
      delta,
    } as MouseDragEvent;

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

  private calculateMoveDelta (event: MouseEvent) {
    const [x, y] = getXYfromMouseEv(event);
    let mouseDelta = vec2_Create(
      x - this.lastPosition[0],
      y - this.lastPosition[1]
    );
    setVec(this.lastPosition, x, y);
    return mouseDelta;
  }

}
