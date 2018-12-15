import find from 'lodash-es/find';
import findLast from 'lodash-es/findLast';
import {Transform, copyTransform, createInitTransform} from 'gl-utils';

export interface Keyframe {
  frameId: number;
  transform: Transform;
}

export const createKeyframe = (frameId: number, transform: Transform) => {
  const keyframe = {
    frameId,
    transform: createInitTransform(),
  };
  copyTransform(keyframe.transform, transform);
  return keyframe;
};


export type Timeline = Keyframe[];

const isKeyframeAt = (frameId: number) => (keyframe: Keyframe) =>
  keyframe.frameId === frameId;

const isKeyframeBefore = (frameId: number) => (keyframe: Keyframe) =>
  keyframe.frameId < frameId;

const isKeyframeAfter = (frameId: number) => (keyframe: Keyframe) =>
  keyframe.frameId > frameId;

export const getKeyframeAt = (timeline: Timeline, frameId: number) =>
  timeline.find(isKeyframeAt(frameId));

export const getKeyframeBefore = (timeline: Timeline, frameId: number) =>
  findLast(timeline, isKeyframeBefore(frameId));

export const getKeyframeAfter = (timeline: Timeline, frameId: number) =>
  find(timeline, isKeyframeAfter(frameId));
