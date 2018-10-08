import {vec3, create as vec3_Create} from 'gl-vec3';
import {vec2, create as vec2_Create} from 'gl-vec2';
import {Axis, hexToVec3} from 'gl-utils';
import {Bone} from 'viewport/armature';
import {get} from 'lodash';

// TODO make $_framePosition:MarkerPosition private, expose as createMarkerPosition and recalcNDC(vp:mat4)

// Marker:
// rendered as dot in viewport, indicates e.g. selectable bone or object
// Used also for gizmo click-handling etc.

const BONE_COLOR = hexToVec3('#7a3ab9');
export const SELECTED_BONE_COLOR = hexToVec3('#935ac6'); // not handled here
const GIZMO_COLOR = hexToVec3('#b93a46'); // actually, will use per-axis colors;
const DEBUG_COLOR = hexToVec3('#4fee55');
const DEFAULT_COLOR = hexToVec3('#4fee55'); // unused

const DEFAULT_RADIUS = 15;

type MarkerOwner = Bone | Axis;

export enum MarkerType { Bone, Gizmo, Debug }

// changes per frame
export interface MarkerPosition {
  position3d: vec3; // world space (point * modelMatrix), used for gizmo placement
  positionNDC: vec2; // NOTE: in NDC(!!!): [-1, 1] x [-1, 1]
}


export class Marker {
  public owner: MarkerOwner;
  public $_framePosition: MarkerPosition; // ! watch out !
  public visible: boolean;
  public clickable: boolean;
  private _radius?: number;
  private _color?: vec3;

  constructor (protoObj?: Object) {
    this.owner = get(protoObj, 'owner', undefined);
    this._radius = get(protoObj, 'radius', undefined);
    this._color = get(protoObj, 'color', undefined);
    this.visible = get(protoObj, 'visible', true);
    this.clickable = get(protoObj, 'clickable', true);
    this.$_framePosition = {
      position3d: vec3_Create(),
      positionNDC: vec2_Create(),
    };
  }

  get type () {
    switch (typeof this.owner) {
      case 'undefined': return MarkerType.Debug;
      case 'number': return MarkerType.Gizmo;
      default: return MarkerType.Bone;
    }
  }

  get radius () {
    if (this._radius) {
      return this._radius;
    }
    return DEFAULT_RADIUS;
  }

  set radius (r: number) { this._radius = r; }

  get color () {
    if (this._color) {
      return this._color;
    }

    switch (this.type) {
      case MarkerType.Bone: return BONE_COLOR;
      case MarkerType.Gizmo: return GIZMO_COLOR;
      case MarkerType.Debug: return DEBUG_COLOR;
      default: return DEFAULT_COLOR;
    }
  }

  set color (r: vec3) { this._color = r; }

  get name () {
    switch (this.type) {
      case MarkerType.Bone: return (this.owner as Bone).name;
      case MarkerType.Gizmo: return `Axis_${this.owner}`;
      case MarkerType.Debug: return `Debug_?`;
      default:
        throw `Invalid marker type in Marker.name: '${this.type}'`;
    }
  }

}
