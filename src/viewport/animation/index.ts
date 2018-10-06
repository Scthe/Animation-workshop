import {vec3, fromValues as vec3_Create} from 'gl-vec3';
import {quat, fromValues as quat_Create} from 'gl-quat';

export * from './getNeighbourKeyframes';
export * from './AnimTimings';

// this is not displayed fps, this internal value how densly the keyframes
// are stored.
export const ANIM_FPS = 24;

export interface Transform {
  position: vec3;
  rotation: quat;
  scale: vec3;
}

// we do not use vec3, quat, cause not sure how
// it works internally
export interface Keyframe {
  frameId: number;
  transform: Transform;
}

export type Timeline = Keyframe[];

// NOTE: we can't freeze TypedArrays, cause they can be slices
export const POSITION_0 = vec3_Create(0, 0, 0);
export const ROTATION_0 = quat_Create(0, 1, 0, 0);
export const SCALE_0 = vec3_Create(1, 1, 1);

export const POS_ROT_SCALE_0 = {
  position: POSITION_0,
  rotation: ROTATION_0,
  scale: SCALE_0,
} as Transform;
Object.freeze(POS_ROT_SCALE_0);
