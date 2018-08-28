import {
  create as mat4_Create,
  identity
} from 'gl-mat4';

// TODO add attributes for bone data

/*
interface Bone {
  name: string;
  children: number[];
  inverseBindMatrice: mat4;
};

interface Skeleton {
  name: string;
  bones: Bone[];
};
*/

// const ReadNodeHeirarchy = (frameId: number, skeleton: Skeleton, boneId: number, parentTransfrom: mat4) => {
// }

export const getBoneTransforms = (frameId: number, nBoneCount: number) => {
  /*
  const root = mat4();
  identity(root);

  const result = mat4[NUM_BONES];
  ReadNodeHeirarchy(frameId, rootBone, root, result);
  return result;
  */
  const transforms = [];
  for (let i = 0; i < nBoneCount; i++) {
    let m = mat4_Create();
    identity(m);
    transforms.push(m);
  }
  return transforms;
};
