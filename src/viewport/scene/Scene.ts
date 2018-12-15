import flatMap from 'lodash-es/flatMap';
import {vec3} from 'gl-vec3';
import {mat4, create as mat4_Create} from 'gl-mat4';
import {Shader, Vao, getMVP, getMV, Axis, hexToVec3} from 'gl-utils';
import {Armature} from 'viewport/armature';
import {CameraFPS} from 'viewport/camera-fps';
import {GlState} from 'viewport/GlState';
import {Marker, MarkerType, MarkerRadiusType} from 'viewport/marker';

export interface Material {
  baseColor: vec3;
}

export interface Mesh {
  vao: Vao;
  indexGlType: GLenum; // e.g. gl.UNSIGNED_SHORT
  indexBuffer: WebGLBuffer;
  triangleCnt: number;
  material: Material;
}

export interface Object3d {
  name: string;
  meshes: Mesh[];
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
    public readonly objects: Object3d[],
    public readonly markerMeta: MarkerMeta,
    public readonly gizmoMeta: GizmoMeta,
  ) {
    const hd = this.debugMarkers;
    const opts = ({ radius: 'small' as MarkerRadiusType, clickable: false});
    hd.dragStart      = new Marker(MarkerType.Debug, {...opts, color: hexToVec3('#318c8f'), });
    hd.dragNow        = new Marker(MarkerType.Debug, {...opts, color: hexToVec3('#69d3d6'), });
    hd.dragNowOnPlane = new Marker(MarkerType.Debug, {...opts, color: hexToVec3('#40c170'), });

    hd.axis = [] as Marker[];
    for (let i = 0; i < DEBUG_AXIS_MARKERS_CNT; i++) {
      hd.axis.push(new Marker(MarkerType.Debug, {
        radius: 'tiny' as MarkerRadiusType,
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

  getVP () {
    return this.getMVP(mat4_Create());
  }

  getMV (modelMatrix: mat4) {
    return getMV (
      modelMatrix,
      this.camera.getViewMatrix()
    );
  }

  private getObjectBoneMarkers() {
    const getObjMarkers = (o: Object3d) => o.bones.map(b => b.marker);
    return flatMap(this.objects, getObjMarkers);
  }

  getMarkers (): Marker[] {
    return [
      ...this.getObjectBoneMarkers(),
      ...this.gizmoMeta.markers,
      ...this.getDebugMarkers(),
    ];
  }

  getMarker (name: string | Axis) {
    if (typeof name === 'string') {
      const markers = this.getObjectBoneMarkers();
      return markers.find(b => b.name === name);
    } else {
      return this.gizmoMeta.markers[name];
    }
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
