import {mat4} from 'gl-mat4';
import {vec3} from 'gl-vec3';
import {
  Shader,
  Vao,
  DrawParameters, applyDrawParams
} from '../gl-utils';

// TODO replace with Scene concept

// readonly object of everything that foes into creating a frame
// properties should change per-frame basis
// produced from UI state
export interface RenderPackage {
  deltaTime: number;

  // camera
  viewMatrix: mat4;
  projectionMatrix: mat4;
  cameraPosition: vec3;

  // test cube
  cubeModelMatrix: mat4;
}


export class ObjectGeometry {
  constructor(
    public vao: Vao,
    public indexBuffer: WebGLBuffer,
    public triangleCnt: number
  ) { }
}

//
export class GlState {
  private drawParams: DrawParameters;

  constructor (
    public gl: Webgl,
    public cubeShader: Shader,
    public cubeGeo: ObjectGeometry,
    public gltfGeo: ObjectGeometry
  ) {
    this.drawParams = new DrawParameters();
    applyDrawParams(gl, this.drawParams, undefined, true);
  }

  setDrawState (nextParams: DrawParameters) {
    applyDrawParams(this.gl, nextParams, this.drawParams);
    this.drawParams = nextParams;
  }

}
