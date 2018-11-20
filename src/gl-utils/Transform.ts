import {vec3, fromValues as vec3_Create, add as vec3_Add} from 'gl-vec3';
import {quat, create as quat_0, multiply as quat_Mul} from 'gl-quat';
import {createModelMatrix} from './index';

const IGNORE_SCALE = 1.0; // for now

export interface Transform {
  position: vec3;
  rotation: quat;
  scale: vec3;
}

export const createInitTransform = () => ({
  position: vec3_Create(0, 0, 0),
  rotation: quat_0(),
  scale: vec3_Create(IGNORE_SCALE, IGNORE_SCALE, IGNORE_SCALE),
} as Transform);

export const POS_ROT_SCALE_0 = createInitTransform();
Object.freeze(POS_ROT_SCALE_0);

// NOTE: we can't freeze TypedArrays, cause they can be slices
export const POSITION_0 = POS_ROT_SCALE_0.position;
export const ROTATION_0 = POS_ROT_SCALE_0.rotation;
export const SCALE_0 = POS_ROT_SCALE_0.scale;

export const convertTransformToMatrix = (transform: Transform) => {
  const {position, rotation} = transform;
  return createModelMatrix(position, rotation, IGNORE_SCALE);
};

export const resetTransform = (transform: Transform) => {
  const setF32 = (buf: Float32Array, vals: Float32Array) => {
    for (let i = 0; i < vals.length; i++) {
      buf[i] = vals[i];
    }
  };

  setF32(transform.position, POSITION_0);
  setF32(transform.rotation, ROTATION_0);
  setF32(transform.scale, SCALE_0);
};

export const addTransforms = (base: Transform, offset: Transform) => {
  vec3_Add(base.position, base.position, offset.position);
  quat_Mul(base.rotation, base.rotation, offset.rotation);
  // vec3_Mul(base.scale, base.scale, offset.scale);
};
