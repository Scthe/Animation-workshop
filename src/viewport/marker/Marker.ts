import {vec3, create as vec3_Create, copy} from 'gl-vec3';
import get from 'lodash-es/get';
import {Axis} from 'gl-utils';
import {Bone} from 'viewport/armature';

import * as MarkerConst from './constants';

// Marker:
// rendered as dot in viewport, indicates e.g. selectable bone or object
// Used also for gizmo click-handling etc.


type MarkerOwner = Bone | Axis;

export enum MarkerType { Bone, Gizmo, Debug }
export const MarkerTypeList = [ // sorted by click priority
  MarkerType.Bone,
  MarkerType.Gizmo,
  MarkerType.Debug
];


// changes per frame
export interface MarkerPosition {
  position3d: vec3; // world space (point * modelMatrix), used for gizmo placement
}

interface MarkerInitOpts {
  owner: MarkerOwner;
  clickable: boolean;
  radius: MarkerConst.MarkerRadiusType;
  color: vec3;
}

export class Marker {
  public visible: boolean;
  public clickable: boolean; // toggleable cause that's how we handle inactive gizmo axis
  public readonly owner: MarkerOwner;
  public readonly _color?: vec3;
  private _radius?: number;
  private $_framePosition: MarkerPosition; // ! watch out !

  constructor (
    public readonly type: MarkerType,
    protoObj?: Partial<MarkerInitOpts>
  ) {
    this.visible = true;
    this.clickable = get(protoObj, 'clickable', true);
    this.owner = get(protoObj, 'owner', undefined);
    this._color = get(protoObj, 'color', undefined);
    this._radius = MarkerConst.getRadiusValue(get(protoObj, 'radius'));
    this.$_framePosition = {
      position3d: vec3_Create(),
    };
  }

  getRadius (uiMarkerScale: number) {
    const scale = this.isScalable() ? (uiMarkerScale / 10.0) : 1.0;

    if (this._radius) {
      return this._radius * scale;
    }
    return MarkerConst.getRadiusValue() * scale;
  }

  set radius (r: number) { this._radius = r; }

  private isScalable() {
    // if is affected by UI marker scale slider
    return this.type === MarkerType.Bone;
  }

  getColor (isSelected = false) {
    if (this._color) {
      return this._color;
    }

    switch (this.type) {
      case MarkerType.Bone:
        return isSelected ? MarkerConst.COLOR_BONE_SELECTED : MarkerConst.COLOR_BONE;
      case MarkerType.Gizmo:
        return MarkerConst.COLOR_GIZMO;
      case MarkerType.Debug:
      default: // might as well
        return MarkerConst.COLOR_DEBUG;
    }
  }

  get name () {
    switch (this.type) {
      case MarkerType.Bone: return (this.owner as Bone).name;
      case MarkerType.Gizmo: return `Axis_${this.owner}`;
      case MarkerType.Debug: return `Debug_?`;
      default:
        throw `Invalid marker type '${this.type}' provided for Marker.name`;
    }
  }

  set $position3d (pos: vec3)  { copy(this.$_framePosition.position3d, pos); }
  get $position3d ()  { return this.$_framePosition.position3d; }

}
