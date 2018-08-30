import {Vao} from '../gl-utils';
import {mat4, create as mat4_Create, identity, copy} from 'gl-mat4';
import {vec3} from 'gl-vec3';
import {vec2} from 'gl-vec2';
import {quat} from 'gl-quat';

//////////
/// General structs mainly for GlState
//////////

export class ObjectGeometry {
  constructor(
    public readonly vao: Vao,
    public readonly indicesGlType: GLenum, // e.g. gl.UNSIGNED_SHORT
    public readonly indexBuffer: WebGLBuffer,
    public readonly triangleCnt: number
  ) { }
}

export class Bone {
  constructor (
    public readonly name: string,
    public readonly bindMatrix: mat4, // used when drawing markers
    public readonly inverseBindMatrix: mat4,
    public readonly children: number[],
    public readonly translation: vec3,
    public readonly rotation: quat,
    public readonly scale: vec3
  ) { }

  getParent (bones: Armature) {
    const selfIdx = bones.reduce((acc, b, idx) => b.name === this.name ? idx : acc, -1);
    if (selfIdx === -1) { return undefined; }
    return bones.filter(b => b.children.indexOf(selfIdx) !== -1)[0];
  }

  getParentBindMatrix (bones: Armature) {
    const bindMat = mat4_Create();
    const parentBone = this.getParent(bones);

    if (!parentBone) {
      identity(bindMat);
    } else {
      copy(bindMat, parentBone.bindMatrix);
    }
    return bindMat;
  }

}

export type Armature = Bone[];

//////////
/// 'Runtime' structs
//////////

/** Animation timing etc. */
export interface AnimState {
  deltaTime: number; // previous -> this frame
  animationFrameId: number; // frame to render, used for interpolation etc.
  frameId: number; // id of current frame
}

export type MarkerPosition = vec2;

/** @see drawMarkers for entire file about markers */
export interface Marker {
  color: vec3;
  position: MarkerPosition; // NOTE: in NDC(!!!): [-1, 1] x [-1, 1]
  renderable: boolean;
}
