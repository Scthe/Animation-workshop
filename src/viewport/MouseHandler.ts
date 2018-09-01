import {GlState} from './GlState';
import {Marker} from './structs';
import {setSelectedObject} from '../UI_State';
import {getMarkerRadius} from './drawMarkers';
import {NDCtoPixels} from '../gl-utils';


const MOUSE_LEFT_BTN = 0; // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button

// based on last left click
enum ClickedState {
  NotClicked, Camera, Object
}


export class MouseHandler {

  private clickedState = ClickedState.NotClicked;
  private lastPosition = [0, 0];

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
    if (event.button === MOUSE_LEFT_BTN) {
      const clickedMarker = this.objectPick(event.pageX, event.pageY);
      if (!clickedMarker) {
        this.clickedState = ClickedState.Camera;
      } else {
        this.clickedState = ClickedState.Object;
        console.log(`Clicked marker: `, clickedMarker);
        setSelectedObject(clickedMarker);
      }
    }
    this.lastPosition[0] = event.pageX;
    this.lastPosition[1] = event.pageY;
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

      default: break;
    }
  }

  private calculateMoveDelta (event: MouseEvent) {
    let mouseDelta = [
      event.pageX - this.lastPosition[0],
      event.pageY - this.lastPosition[1],
    ];
    this.lastPosition[0] = event.pageX;
    this.lastPosition[1] = event.pageY;
    return mouseDelta;
  }

}
