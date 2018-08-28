import {
  createWebGlContext,
  Shader,
  Vao,
  DrawParameters, applyDrawParams
} from '../gl-utils';
import {CameraFPS} from './camera-fps';
import {readGltf} from './readGltf';

export class ObjectGeometry {
  constructor(
    public vao: Vao,
    public indicesGlType: GLenum, // e.g. gl.UNSIGNED_SHORT
    public indexBuffer: WebGLBuffer,
    public triangleCnt: number
  ) { }
}

export class GlState {
  private drawParams: DrawParameters;

  constructor (
    public gl: Webgl,
    private canvas: HTMLCanvasElement,
    public camera: CameraFPS,
    public lampShader: Shader,
    public lampObject: ObjectGeometry
  ) {
    this.drawParams = new DrawParameters();
    applyDrawParams(gl, this.drawParams, undefined, true);
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

}

// init function
export const createGlState = async (canvasId: string, gltfUrl: string) => {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  const gl = createWebGlContext(canvas, {});
  const camera = new CameraFPS(canvas, {
    fovDgr: 90,
    zNear: 0.1,
    zFar: 100,
  });

  const lampShader = new Shader(gl,
    require('shaders/lampShader.vert.glsl'),
    require('shaders/lampShader.frag.glsl'));

  const {lampObject} = await readGltf(gl, gltfUrl, {
    lampShader: lampShader,
  });

  return new GlState(
    gl, canvas, camera,
    lampShader,
    lampObject,
  );
};
