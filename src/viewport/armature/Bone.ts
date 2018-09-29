import {mat4, create as mat4_Create, identity, copy} from 'gl-mat4';
import {vec3} from 'gl-vec3';
import {quat} from 'gl-quat';
import {includes} from 'lodash';
import {Armature} from './index';
import {Marker} from 'viewport/marker';

interface BoneData {
  bindMatrix: mat4; // used when drawing markers
  inverseBindMatrix: mat4;
  translation: vec3;
  rotation: quat;
  scale: vec3;
}

export class Bone {
  constructor (
    public readonly name: string,
    public readonly children: number[],
    public readonly data: BoneData,
    // public readonly cfg: BoneConfigEntry;
    public marker: Marker,
    public $_frameCache: mat4, // ! watch out !
  ) { }

  getParent (bones: Armature) {
    const selfIdx = bones.findIndex(bone => bone.name === this.name);
    if (selfIdx === -1) { return undefined; }

    const isParent = (bone: Bone) => includes(bone.children, selfIdx);
    return bones.filter(isParent)[0];
  }

  getParentBindMatrix (bones: Armature) {
    const bindMat = mat4_Create();
    const parentBone = this.getParent(bones);

    if (!parentBone) {
      identity(bindMat);
    } else {
      copy(bindMat, parentBone.data.bindMatrix);
    }
    return bindMat;
  }

}
