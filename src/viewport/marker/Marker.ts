import {vec3, fromValues as vec3_Create} from 'gl-vec3';
import {vec2, fromValues as vec2_Create} from 'gl-vec2';
import {Axis, hexToVec3} from 'gl-utils';
import {Bone} from 'viewport/armature';
import {get} from 'lodash';


// Marker:
// rendered as dot in viewport, indicates e.g. selectable bone or object
// Used also for gizmo click-handling etc.



type MarkerOwner = Bone | Axis;

export enum MarkerType { Bone, Gizmo }

// changes per frame
export interface MarkerPosition {
  position3d: vec3; // used for gizmo placement
  positionNDC: vec2; // NOTE: in NDC(!!!): [-1, 1] x [-1, 1]
}


export class Marker {
  public owner: MarkerOwner;
  public $_framePosition: MarkerPosition; // ! watch out !
  private _radius?: number;
  private _color?: vec3;

  constructor (protoObj?: Object) {
    this.owner = get(protoObj, 'owner', undefined);
    this._radius = get(protoObj, 'radius', undefined);
    this._color = get(protoObj, 'color', undefined);
    this.$_framePosition = {
      position3d: vec3_Create(0, 0, 0),
      positionNDC: vec2_Create(0, 0),
    };
  }

  get type () {
    if (typeof this.owner === 'number') {
      return MarkerType.Gizmo;
    } else {
      return MarkerType.Bone;
    }
  }

  get radius () {
    switch (this.type) {
      case MarkerType.Gizmo:
        return this._radius || 20;

      default:
        return 15;
    }
  }

  set radius (r: number) { this._radius = r; }

  get color () {
    if (this._color) {
      return this._color;
    }

    switch (this.type) {
      case MarkerType.Bone: return hexToVec3('#823ab9');
      case MarkerType.Gizmo: return hexToVec3('#b93a46'); // actually, will use per-axis colors
      default: return hexToVec3('#4fee55');
    }
  }

  set color (r: vec3) { this._color = r; }

  get name () {
    switch (this.type) {
      case MarkerType.Bone: return (this.owner as Bone).name;
      case MarkerType.Gizmo: return `Axis_${this.owner}`;
      default:
        throw `Invalid marker type in Marker.name: '${this.type}'`;
    }
  }

}
