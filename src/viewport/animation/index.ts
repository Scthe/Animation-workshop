import {Transform} from 'gl-utils';

export * from './getNeighbourKeyframes';
export * from './AnimTimings';

// this is not displayed fps, this internal value how densly the keyframes
// are stored.
export const ANIM_FPS = 24;



// we do not use vec3, quat, cause not sure how
// it works internally
export interface Keyframe {
  frameId: number;
  transform: Transform;
}

export type Timeline = Keyframe[];
