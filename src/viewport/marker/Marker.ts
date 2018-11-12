import {vec3, create as vec3_Create} from 'gl-vec3';
import {vec2, fromValues as vec2_Create} from 'gl-vec2';
import {mat4} from 'gl-mat4';
import {get} from 'lodash';
import {Axis, hexToVec3, transformPointByMat4} from 'gl-utils';
import {Bone} from 'viewport/armature';

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
  public visible: boolean;
  public clickable: boolean;
  private _radius?: number;
  private _color?: vec3;
  private $_framePosition: MarkerPosition; // ! watch out !

  constructor (
    public readonly type: MarkerType,
    protoObj?: Object
  ) {
    this.owner = get(protoObj, 'owner', undefined);
    this.visible = get(protoObj, 'visible', true);
    this.clickable = get(protoObj, 'clickable', true);
    this._radius = get(protoObj, 'radius', undefined);
    this._color = get(protoObj, 'color', undefined);
    this.$_framePosition = {
      position3d: vec3_Create(),
      positionNDC: vec2_Create(0, 0),
    };
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
        throw `Invalid marker type '${this.type}' provided for Marker.name`;
    }
  }

  set __$position3d (pos: vec3)  { this.$_framePosition.position3d = pos; } // debug only pls
  get $position3d ()  { return this.$_framePosition.position3d; }
  get $positionNDC () { return this.$_framePosition.positionNDC; }

  // mvp: mat4, modelMatrix: mat4, pos: vec3
  updatePosition (pos: vec3, modelMatrix: mat4, mvp: mat4) {
    const $pos = this.$_framePosition;
    $pos.position3d = transformPointByMat4(pos, modelMatrix, true);
    const resultNDC = transformPointByMat4(pos, mvp, false); // mvp already contains modelMatrix, so cant use recalcNDC
    $pos.positionNDC = vec2_Create(resultNDC[0], resultNDC[1]);
  }

  /** NOTE: takes vp, NOT mvp. !Dangerous! */
  recalcNDC (vp: mat4) {
    const $pos = this.$_framePosition;
    const resultNDC = transformPointByMat4($pos.position3d, vp, false);
    $pos.positionNDC = vec2_Create(resultNDC[0], resultNDC[1]);
  }

}
