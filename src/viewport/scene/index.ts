import {Shader, Vao, getMVP} from 'gl-utils';
import {Armature} from 'viewport/armature';
import {CameraFPS} from 'viewport/camera-fps';
import {mat4} from 'gl-mat4';
import {GlState} from 'viewport/GlState';
// import {BoneConfigEntry} from './config';

export * from './createScene';
export {getNode} from './loader/_utils';
export * from './loader/loadMesh';
export * from './loader/loadBones';

// TODO unify API (always take FrameEnv etc.)

// TODO better GlState/Scene split
// TODO move markers here
// TODO final glb
// TODO display only correct axis in gizmo
// TODO connect ui with viewport (drawMarkers, gizmo/marker size etc.)
// TODO connect config with viewport



export interface Mesh {
  vao: Vao;
  indexGlType: GLenum; // e.g. gl.UNSIGNED_SHORT
  indexBuffer: WebGLBuffer;
  triangleCnt: number;
}

export interface Object3d {
  mesh: Mesh;
  bones: Armature;
  modelMatrix: mat4;
}

// interface SceneMarker {} // or just normal marker?

// interface SceneGizmo { mesh: Mesh; markers[]; }


/*
contains:
  * objects (only: material, mesh, Armature)
  * bones
  * markers
*/
export class Scene {

  constructor (
    public readonly glState: GlState,
    public readonly camera: CameraFPS,
    public readonly materialWithArmature: Shader,
    public readonly lamp: Object3d,
  ) {}

  getMVP (modelMatrix: mat4) {
    const [width, height] = this.glState.getViewport();

    return getMVP (
      modelMatrix,
      this.camera.getViewMatrix(),
      this.camera.getProjectionMatrix(width, height)
    );
  }

}
