import {GltfLoader} from 'gltf-loader-ts';
import {mat4, multiply, create as mat4_Create} from 'gl-mat4';
import {Armature} from './armature';
import {Marker, MarkerType, MarkerPosition} from './marker';
import {
  createWebGlContext, Axis,
  Shader,
  Vao,
  DrawParameters, applyDrawParams
} from '../gl-utils';
import {CameraFPS} from './camera-fps';
import {readObject} from './readGltfObject';
import {readArmature} from './readGltfArmature';
import {initMarkersDraw} from './marker';
import {MouseHandler, MouseDragEvent} from './MouseHandler';
import {initGizmoDraw, applyGizmoMove, applyGizmoRotate} from './gizmo';
import {setSelectedObject} from '../UI_State';

const CAMERA_SETTINGS = {
  fovDgr: 90,
  zNear: 0.1,
  zFar: 100,
};

const SHADERS = {
  LAMP_VERT: require('shaders/lampShader.vert.glsl'),
  LAMP_FRAG: require('shaders/lampShader.frag.glsl'),
};

export class ObjectGeometry {
  constructor(
    public readonly vao: Vao,
    public readonly indicesGlType: GLenum, // e.g. gl.UNSIGNED_SHORT
    public readonly indexBuffer: WebGLBuffer,
    public readonly triangleCnt: number
  ) { }
}


export class GlState {

  public gl: Webgl;
  private canvas: HTMLCanvasElement;
  private drawParams: DrawParameters;
  public camera: CameraFPS;
  // IO
  private mouseHander: MouseHandler;
  public pressedKeys: boolean[] = new Array(128); // keycode => bool
  // objects: lamp
  public lampShader: Shader;
  public lampObject: ObjectGeometry;
  public lampArmature: Armature;
  // markers & misc
  private markers: Marker[] = [];
  private activeMarker: number;
  private activeAxis: Axis; // meaningful if clicked axis


  async init (canvasId: string, gltfUrl: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.gl = createWebGlContext(this.canvas, {});
    this.camera = new CameraFPS(CAMERA_SETTINGS);

    this.drawParams = new DrawParameters();
    applyDrawParams(this.gl, this.drawParams, undefined, true);

    const loader = new GltfLoader();
    const asset = await loader.load(gltfUrl);
    // console.log('asset', asset);
    // console.log('gltf', asset.gltf);

    // objects: lamp
    this.lampShader = new Shader(this.gl, SHADERS.LAMP_VERT, SHADERS.LAMP_FRAG);
    this.lampArmature = await readArmature(asset, 'SkeletonTest');
    this.lampObject = await readObject(this.gl, asset, this.lampShader, 'Cube', {
      'POSITION': 'a_Position',
      'JOINTS_0': 'a_BoneIDs',
      'WEIGHTS_0': 'a_Weights',
    });

    // objects: markers
    initMarkersDraw(this.gl);

    // gizmo
    await initGizmoDraw(this.gl);

    // IO
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
    return {
      width: this.canvas.width,
      height: this.canvas.height,
    };
  }

  getMVP (modelMatrix: mat4) {
    const {width, height} = this.getViewport();

    const vp = mat4_Create();
    multiply(vp, this.camera.getProjectionMatrix(width, height), this.camera.getViewMatrix());

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
