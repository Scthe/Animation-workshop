import {Shader, Vao} from 'gl-utils';
import {Armature} from 'viewport/armature';
import {CameraFPS} from 'viewport/camera-fps';
// import {BoneConfigEntry} from './config';

export * from './createScene';
export {getNode} from './loader/_utils';
export * from './loader/loadMesh';
export * from './loader/loadBones';

// TODO fix camera mouse listener
// TODO better GlState/Scene split
// TODO move markers here
// TODO unify API (always take FrameEnv etc.)
// TODO final glb
// TODO display only correct axis in gizmo
// TODO connect ui with viewport (drawMarkers, gizmo/marker size etc.)
// TODO connect config with viewport


/*export interface SceneBone {
  name: string;
  cfg: BoneConfigEntry;
  data: Bone;
}*/

export interface Mesh {
  vao: Vao;
  indexGlType: GLenum; // e.g. gl.UNSIGNED_SHORT
  indexBuffer: WebGLBuffer;
  triangleCnt: number;
}

/*export interface Object3d {
  mesh: Mesh;
  bones: SceneBone[];
}*/

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
    public readonly camera: CameraFPS,
    public readonly materialWithArmature: Shader,
    public readonly lampMesh: Mesh,
    public readonly lampBones: Armature,
  ) {}

}
