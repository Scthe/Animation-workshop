import {mat4, create as mat4_Create, copy, multiply} from 'gl-mat4';
import {vec3} from 'gl-vec3';
import {quat} from 'gl-quat';
import {includes} from 'lodash';
import {Armature} from './index';
import {Marker, MarkerType} from 'viewport/marker';
import {Transform, createInitTransform} from 'gl-utils';

interface BoneData {
  readonly bindMatrix: mat4; // used when drawing markers
  readonly inverseBindMatrix: mat4;
  readonly translation: vec3;
  readonly rotation: quat;
  readonly scale: vec3;
}

interface BoneFrameCache {
  // transformation from animation only - does not inlcude bind position
  // animTransformOffset: Transform;
  // to be used in shader
  finalBoneMatrix: mat4;
  //
  parentGlobalTransform: mat4;
}

export class Bone {
  private $_frameCache: BoneFrameCache;
  public marker: Marker;

  constructor (
    public readonly name: string,
    public readonly children: number[],
    public readonly data: BoneData,
  ) {
    this.marker = new Marker(MarkerType.Bone);
    this.marker.owner = this;
    this.$_frameCache = {
      // animTransformOffset: createInitTransform(),
      finalBoneMatrix: mat4_Create(),
      parentGlobalTransform: mat4_Create(),
    } as BoneFrameCache;
    Object.freeze(this.data);
  }

  getParent (bones: Armature) {
    const selfIdx = bones.findIndex(bone => bone.name === this.name);
    if (selfIdx === -1) { return undefined; }

    const isParent = (bone: Bone) => includes(bone.children, selfIdx);
    return bones.filter(isParent)[0];
  }

  // getParentFrameMatrix (bones: Armature) {
    // const parent = this.getParent(bones);
    // return parent ? parent.getFrameMatrix() : mat4_Create();
  // }

  getParentBindMatrix (bones: Armature) {
    const bindMat = mat4_Create();
    const parentBone = this.getParent(bones);

    if (parentBone) {
      copy(bindMat, parentBone.data.bindMatrix);
    }

    return bindMat;
  }

  /** get bone matrix for current frame */
  // getFrameMatrix () {
    // const boneMat = this.$_frameCache.finalBoneMatrix;
    // const {bindMatrix} = this.data;
    // return multiply(mat4_Create(), boneMat, bindMatrix);
  // }

  getFrameMatrix2 () {
    return this.$_frameCache.finalBoneMatrix;
  }

  getFrameCache () {
    return this.$_frameCache;
  }

}
