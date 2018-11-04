import {vec3} from 'gl-vec3';
import {mat4, create as mat4_Create} from 'gl-mat4';
import {Shader, Vao, getMVP, Axis, hexToVec3} from 'gl-utils';
import {Plane} from 'gl-utils/raycast';
import {Armature} from 'viewport/armature';
import {CameraFPS} from 'viewport/camera-fps';
import {GlState} from 'viewport/GlState';
import {Marker, MarkerType} from 'viewport/marker';

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
  axisVectors: vec3[];
  rotationPlane: Plane;
}

// debug drag system
interface DebugMarkers {
  axis: Marker[];
  dragStart: Marker;
  dragNow: Marker;
  dragNowOnPlane: Marker;
}
const DEBUG_AXIS_MARKERS_CNT = 10;


/*
contains:
  * objects (only: material, mesh, Armature)
  * bones
  * markers
*/
export class Scene {

  public readonly debugMarkers = {} as DebugMarkers;

  constructor (
    public readonly glState: GlState,
    public readonly camera: CameraFPS,
    public readonly materialWithArmature: Shader,
    public readonly lamp: Object3d,
    public readonly markerMeta: MarkerMeta,
    public readonly gizmoMeta: GizmoMeta,
  ) {
    const hd = this.debugMarkers;
    const opts = ({ radius: 10, visible: true, clickable: false, color: hexToVec3('#eec64f')});
    hd.dragStart      = new Marker(MarkerType.Debug, opts);
    hd.dragNow        = new Marker(MarkerType.Debug, opts);
    hd.dragNowOnPlane = new Marker(MarkerType.Debug, opts);

    hd.axis = [] as Marker[];
    for (let i = 0; i < DEBUG_AXIS_MARKERS_CNT; i++) {
      hd.axis.push(new Marker(MarkerType.Debug, {
        radius: 2,
        visible: true,
        clickable: false,
      }));
    }
  }

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
      ...this.getDebugMarkers(),
    ];
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

  updateDebugMarkers () {
    const ident = mat4_Create();
    const vpMat = this.getMVP(ident);

    this.getDebugMarkers().forEach(m => m.recalcNDC(vpMat));
  }

  private getDebugMarkers () {
    return [
      ...this.debugMarkers.axis,
      this.debugMarkers.dragStart,
      this.debugMarkers.dragNow,
      this.debugMarkers.dragNowOnPlane,
    ];
  }

}
