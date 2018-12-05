import {mat4, create as mat4_Create, copy} from 'gl-mat4';
import {includes} from 'lodash';
import {Armature} from './index';
import {Marker, MarkerType} from 'viewport/marker';
import {Transform, createInitTransform} from 'gl-utils';

interface BoneData {
  readonly bindMatrix: mat4; // used when drawing markers
  readonly inverseBindMatrix: mat4;
  readonly bindTransform: Transform;
}

// @see calculateBoneMatrices.ts for more details
interface BoneFrameCache {
  // matrix send to shader
  finalBoneMatrix: mat4;
  // if bone has to be used as parent space
  globalTransform: mat4;
  // result of keyframe interpolation (and gizmo dragging),
  // basis for matrices calculation
  animationTransform: Transform;
}

export class Bone {
  private $_frameCache: BoneFrameCache;
  public marker: Marker;

  constructor (
    public readonly name: string,
    public readonly children: number[],
    public readonly data: BoneData,
  ) {
    this.marker = new Marker(MarkerType.Bone, {
      owner: this,
    });
    this.$_frameCache = {
      finalBoneMatrix: mat4_Create(),
      globalTransform: mat4_Create(),
      animationTransform: createInitTransform(),
    };
    Object.freeze(this.data);
  }

  getParent (bones: Armature) {
    const selfIdx = bones.findIndex(bone => bone.name === this.name);
    if (selfIdx === -1) { return undefined; }

    const isParent = (bone: Bone) => includes(bone.children, selfIdx);
    return bones.filter(isParent)[0];
  }

  getParentBindMatrix (bones: Armature) {
    const bindMat = mat4_Create();
    const parentBone = this.getParent(bones);

    if (parentBone) {
      copy(bindMat, parentBone.data.bindMatrix);
    }

    return bindMat;
  }

  /** Returns bone matrix for this frame */
  get $frameMatrix () {
    return this.$_frameCache.finalBoneMatrix;
  }

  /** Returns animation transform for this frame
    * (interpolated from keyframes and current gizmo drag)
    */
  get $frameTransform() {
    return this.$_frameCache.animationTransform;
  }

  getFrameCache () {
    return this.$_frameCache;
  }

}
