import {Shader, Vao, getMVP, Axis} from 'gl-utils';
import {Armature} from 'viewport/armature';
import {CameraFPS} from 'viewport/camera-fps';
import {mat4} from 'gl-mat4';
import {GlState} from 'viewport/GlState';
import {Marker, MarkerPosition} from 'viewport/marker';
// import {BoneConfigEntry} from './config';

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


// does not hold info about markers, just some aux stuff to render
interface MarkerMeta {
  shader: Shader;
  instancingVAO: Vao; // single attr: [0, ..., VertCnt]
}

// does not hold info about gizmo, just some aux stuff to render
// markers are mostly per-frame cache, tho they have hardcoded per-axis colors
interface GizmoMeta {
  shader: Shader;
  moveMesh: Mesh;
  rotateMesh: Mesh;
  markers: Marker[]; // only 3, but no Array<Marker, 3> in TS
}


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
    public readonly markerMeta: MarkerMeta,
    public readonly gizmoMeta: GizmoMeta,
  ) {}

  getMVP (modelMatrix: mat4) {
    const [width, height] = this.glState.getViewport();

    return getMVP (
      modelMatrix,
      this.camera.getViewMatrix(),
      this.camera.getProjectionMatrix(width, height)
    );
  }

  getMarkers () {
    return [
      ...this.lamp.bones.map(b => b.marker),
      ...this.gizmoMeta.markers,
    ];
  }

  updateMarker (name: string | Axis, position: MarkerPosition) {
    const marker = this.getMarker(name);

    if (marker) {
      marker.$_framePosition = position;
    } else {
      throw `Could not find marker for update. Searched by: '${name}'`;
    }

    return marker;
  }

  getMarker (name: string | Axis) {
    if (typeof name === 'string') {
      const bone = this.lamp.bones.find(b => b.name === name);
      if (bone) {
        return bone.marker;
      }
    } else {
      return this.gizmoMeta.markers[name];
    }

    return undefined;
  }

}
