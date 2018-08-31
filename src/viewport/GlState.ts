import {
  createWebGlContext,
  Shader,
  Vao,
  DrawParameters, applyDrawParams
} from '../gl-utils';
import {GltfLoader} from 'gltf-loader-ts';
import {CameraFPS} from './camera-fps';
import {readObject} from './readGltfObject';
import {readArmature} from './readGltfArmature';
import {ObjectGeometry, Armature, Marker} from './structs';
import {createMarkersVao} from './drawMarkers';
import {mat4, multiply, create as mat4_Create} from 'gl-mat4';
import {MouseHandler} from './MouseHandler';
import {createGizmoGeo} from './drawGizmos';

const CAMERA_SETTINGS = {
  fovDgr: 90,
  zNear: 0.1,
  zFar: 100,
};

const SHADERS = {
  LAMP_VERT: require('shaders/lampShader.vert.glsl'),
  LAMP_FRAG: require('shaders/lampShader.frag.glsl'),
  MARKER_VERT: require('shaders/marker.vert.glsl'),
  MARKER_FRAG: require('shaders/marker.frag.glsl'),
  GIZMO_VERT: require('shaders/gizmo.vert.glsl'),
};

interface LastFrameCache {
  markers: Marker[]; // mouse handling is async
}

export class GlState {

  public gl: Webgl;
  private canvas: HTMLCanvasElement;
  private drawParams: DrawParameters;
  public camera: CameraFPS;
  public lastFrameCache: LastFrameCache;
  // IO
  private mouseHander: MouseHandler;
  public pressedKeys: boolean[] = new Array(128); // keycode => bool
  // objects: lamp
  public lampShader: Shader;
  public lampObject: ObjectGeometry;
  public lampArmature: Armature;
  // objects: dots to indicate object's origins
  public markersShader: Shader;
  public markersVao: Vao;
  // gizmo
  public gizmoShader: Shader;
  public gizmoMoveGeometry: ObjectGeometry;

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
    this.markersShader = new Shader(this.gl, SHADERS.MARKER_VERT, SHADERS.MARKER_FRAG);
    this.markersVao = createMarkersVao(this.gl, this.markersShader);

    // gizmo
    this.gizmoShader = new Shader(this.gl, SHADERS.GIZMO_VERT, SHADERS.LAMP_FRAG);
    this.gizmoMoveGeometry = await createGizmoGeo(this.gl, this.gizmoShader);

    // cache
    this.lastFrameCache = { markers: [], };

    // IO
    this.mouseHander = new MouseHandler(this.canvas, this);
    window.addEventListener('keydown', event => {
      this.pressedKeys[event.keyCode] = true;
    }, false);
    window.addEventListener('keyup', event => {
      this.pressedKeys[event.keyCode] = false;
    }, false);
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

}
