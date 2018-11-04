import {vec3, fromValues as vec3_Create} from 'gl-vec3';
import {quat, fromValues as quat_Create} from 'gl-quat';

export interface Transform {
  position: vec3;
  rotation: quat;
  scale: vec3;
}

export const createInitTransform = () => ({
  position: vec3_Create(0, 0, 0),
  rotation: quat_Create(0, 1, 0, 0),
  scale: vec3_Create(1, 1, 1),
} as Transform);

export const POS_ROT_SCALE_0 = createInitTransform();
Object.freeze(POS_ROT_SCALE_0);

// NOTE: we can't freeze TypedArrays, cause they can be slices
export const POSITION_0 = POS_ROT_SCALE_0.position;
export const ROTATION_0 = POS_ROT_SCALE_0.rotation;
export const SCALE_0 = POS_ROT_SCALE_0.scale;
