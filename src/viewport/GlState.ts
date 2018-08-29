import {
  createWebGlContext,
  Shader,
  Vao,
  DrawParameters, applyDrawParams
} from '../gl-utils';
import {CameraFPS} from './camera-fps';
import {readGltf} from './readGltf';
import {mat4} from 'gl-mat4';
import {vec3} from 'gl-vec3';
import {quat} from 'gl-quat';

export class ObjectGeometry {
  constructor(
    public readonly vao: Vao,
    public readonly indicesGlType: GLenum, // e.g. gl.UNSIGNED_SHORT
    public readonly indexBuffer: WebGLBuffer,
    public readonly triangleCnt: number
  ) { }
}

export class Bone {
  constructor (
    public readonly name: string,
    public readonly inverseBindMatrix: mat4,
    public readonly children: number[],
    public readonly translation: vec3,
    public readonly rotation: quat,
    public readonly scale: vec3
  ) { }
}

export type Armature = Bone[];

export class GlState {
  private drawParams: DrawParameters;

  constructor (
    public readonly gl: Webgl,
    private canvas: HTMLCanvasElement,
    public readonly camera: CameraFPS,
    public readonly lampShader: Shader,
    public readonly lampObject: ObjectGeometry,
    public readonly lampArmature: Armature
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

  const {lampObject, lampArmature} = await readGltf(gl, gltfUrl, {
    lampShader: lampShader,
  });

  return new GlState(
    gl, canvas, camera,
    lampShader, lampObject, lampArmature
  );
};
