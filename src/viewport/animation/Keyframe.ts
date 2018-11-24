import {Transform, copyTransform, createInitTransform} from 'gl-utils';

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
