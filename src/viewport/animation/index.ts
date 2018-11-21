import {Transform, copyTransform, createInitTransform} from 'gl-utils';

export * from './AnimTimings';
export * from './interpolate';

// this is not displayed fps, this is an internal value how densly the keyframes
// are stored.
export const ANIM_FPS = 24;


export interface Keyframe {
  frameId: number;
  transform: Transform;
}

export type Timeline = Keyframe[];

export const createKeyframe = (frameId: number, transform: Transform) => {
  const keyframe = {
    frameId,
    transform: createInitTransform(),
  };
  copyTransform(keyframe.transform, transform);
  return keyframe;
};
