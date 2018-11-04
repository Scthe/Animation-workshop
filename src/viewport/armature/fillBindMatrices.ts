import {mat4, create as mat4_Create, invert, multiply} from 'gl-mat4';
import {createModelMatrix} from 'gl-utils';
import {Bone} from './Bone';

import * as GLTF_PLS from 'viewport/gltfExporterFixes';


// we calculate by hand, since blender exporter is broken beyond belief
export const fillBindMatrices = (bones: Bone[]) => {
  const calculateBone = (idx: number, parentMat: mat4) => {
    const {data} = bones[idx];

    const boneMat = createModelMatrix(data.translation, data.rotation, data.scale[0]);
    multiply(data.bindMatrix, parentMat, boneMat);
    multiply(data.bindMatrix, data.bindMatrix, GLTF_PLS.BIND_MATRIX_FIX);

    invert(data.inverseBindMatrix, data.bindMatrix);

    bones[idx].children.forEach((childIdx: number) => {
      calculateBone(childIdx, data.bindMatrix);
    });
  };

  calculateBone(0, mat4_Create());
};
