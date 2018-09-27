import {mat4, multiply, create as mat4_Create} from 'gl-mat4';
import {Marker, MarkerType, MarkerPosition} from './marker';
import {
  createWebGlContext, Axis,
  DrawParameters, applyDrawParams
} from 'gl-utils';
import {initMarkersDraw} from './marker';
import {MouseHandler, MouseDragEvent} from './MouseHandler';
import {initGizmoDraw, applyGizmoMove, applyGizmoRotate} from './gizmo';
import {setSelectedObject} from '../UI_State';


export class GlState {

  public gl: Webgl;
  private canvas: HTMLCanvasElement;
  private drawParams: DrawParameters;
  // IO
  public mouseHander: MouseHandler;
  public pressedKeys: boolean[] = new Array(128); // keycode => bool
  // markers & misc
  private markers: Marker[] = [];
  private activeMarker: number;
  private activeAxis: Axis; // meaningful if clicked axis


  async init (canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = createWebGlContext(this.canvas, {});

    this.drawParams = new DrawParameters();
    applyDrawParams(this.gl, this.drawParams, undefined, true);

    // objects: markers
    initMarkersDraw(this.gl);

    // gizmo
    await initGizmoDraw(this.gl);

    // IO TODO move this to main
    this.initIO();
  }

  private initIO () {
    this.mouseHander = new MouseHandler(this.canvas, this);

    this.onMarkerClicked = this.onMarkerClicked.bind(this);
    this.onMarkerDragged = this.onMarkerDragged.bind(this);
    this.mouseHander.setOnMarkerClicked(this.onMarkerClicked);
    this.mouseHander.setOnMarkerDragged(this.onMarkerDragged);

    window.addEventListener('keydown', event => {
      this.pressedKeys[event.keyCode] = true;
    }, false);
    window.addEventListener('keyup', event => {
      this.pressedKeys[event.keyCode] = false;
    }, false);
  }

  private onMarkerClicked (marker: Marker) {
    console.log(`Clicked marker: `, marker);
    const markerIdx = this.markers.reduce((acc: number, m, i: number) => m.name === marker.name ? i : acc, undefined);
    this.activeMarker = markerIdx;

    switch (marker.type) {
      case MarkerType.GizmoMove:
      case MarkerType.GizmoRotate:
        this.activeAxis = Axis[marker.name as any] as any as Axis;
        break;

      case MarkerType.Armature:
      case MarkerType.Object:
      default:
        setSelectedObject(marker);
        break;
    }
  }

  private onMarkerDragged (ev: MouseDragEvent) {
    const lastClickedMarker = this.markers[this.activeMarker];

    switch (lastClickedMarker.type) {
      case MarkerType.GizmoMove:
        applyGizmoMove(ev, this.activeAxis);
        break;
      case MarkerType.GizmoRotate:
        applyGizmoRotate(ev, this.activeAxis);
        break;
      default:
        break;
    }
  }

  setDrawState (nextParams: DrawParameters) {
    applyDrawParams(this.gl, nextParams, this.drawParams);
    this.drawParams = nextParams;
  }

  getViewport () {
    return [this.canvas.width, this.canvas.height];
  }

  getMVP (modelMatrix: mat4, camera: any) { // TODO move
    const [width, height] = this.getViewport();

    const vp = mat4_Create();
    multiply(vp, camera.getProjectionMatrix(width, height), camera.getViewMatrix());

    const mvp = mat4_Create();
    multiply(mvp, vp, modelMatrix);

    return mvp;
  }

  // Markers:

  updateMarker (name: string, type: MarkerType, position: MarkerPosition) {
    const marker = this.getMarker(name, type);
    if (!marker) {
      this.markers.push({
        name, type, position
      });
    } else {
      marker.position = position;
    }

    return this.getMarker(name, type);
  }

  getMarkers () {
    return [...this.markers];
  }

  getMarker (name: string, type: MarkerType) {
    return this.markers.filter(m => m.name === name && m.type === type)[0];
  }

}
