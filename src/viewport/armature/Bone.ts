import {mat4, create as mat4_Create, identity, copy} from 'gl-mat4';
import {vec3} from 'gl-vec3';
import {quat} from 'gl-quat';
import {Armature} from './index';

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
