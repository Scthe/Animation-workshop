import {fromValues as vec3_Create} from 'gl-vec3';
import {mat4, create as mat4_Create, invert, multiply, fromScaling} from 'gl-mat4';
import {createModelMatrix} from 'gl-utils';
import {Bone} from './Bone';

// We are using custom bind matrices, which means that we have to fix
// some issues with how blender exports positions.
// If we use bind matrices from blender exporter, the model is
// flipped on x-axis and some other weird issues
//
// All this is similar to left/right-hand coordinate system conversion
const BLENDER_EXPORTER_PLS = fromScaling(mat4_Create(), vec3_Create(-1, 1, 1));


// we calculate by hand, since blender exporter is broken beyond belief
export const fillBindMatrices = (bones: Bone[]) => {
  const calculateBone = (idx: number, parentMat: mat4) => {
    const {data} = bones[idx];

    const boneMat = createModelMatrix(data.translation, data.rotation, data.scale[0]);
    multiply(data.bindMatrix, parentMat, boneMat);
    multiply(data.bindMatrix, data.bindMatrix, BLENDER_EXPORTER_PLS); // apply blender exporter fix

    invert(data.inverseBindMatrix, data.bindMatrix);

    bones[idx].children.forEach((childIdx: number) => {
      calculateBone(childIdx, data.bindMatrix);
    });
  };

  calculateBone(0, mat4_Create());
};
