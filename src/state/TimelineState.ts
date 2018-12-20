import sortBy from 'lodash-es/sortBy';
import cloneDeep from 'lodash-es/cloneDeep';
import uniq from 'lodash-es/uniq';
import flatten from 'lodash-es/flatten';

import {observable, action, computed} from 'mobx';
import {Timeline, createKeyframe} from 'viewport/animation';
import {Transform} from 'gl-utils';


export const TIMELINE_DEFAULT = {};
Object.freeze(TIMELINE_DEFAULT);

export type TimelineMap = {[key: string]: Timeline};
type BoneName = string;


const removeKeyframeAt = (timeline: Timeline, frameId: number) =>
  timeline.filter(keyframe => keyframe.frameId !== frameId);

export class TimelineState {
  // all animation data
  @observable timelines: TimelineMap;

  constructor (initVal: TimelineMap) {
    this.timelines = cloneDeep(initVal);
  }

  @computed
  get framesWithKeyframe () {
    const getKeyframeIds = (t: Timeline) => t.map(kf => kf.frameId);
    const keyframeIdsMap = Object.keys(this.timelines).map(boneName =>
      getKeyframeIds(this.timelines[boneName])
    );
    return sortBy(uniq(flatten(keyframeIdsMap)));
  }

  getTimeline (boneName: BoneName) {
    if (!this.timelines[boneName]) {
      this.setTimeline(boneName, [] as Timeline);
    }
    return this.timelines[boneName];
  }

  private setTimeline (boneName: BoneName, timeline: Timeline) {
    this.timelines[boneName] = sortBy(timeline, ['frameId']);
  }

  hasKeyframeAt (boneName: BoneName, frameId: number) {
    return !!this.getKeyframeAt(boneName, frameId);
  }

  @action
  setKeyframeAt (boneName: BoneName, frameId: number, transform: Transform) {
    const timeline = this.getTimeline(boneName);
    const newTimeline: Timeline = [
      ...removeKeyframeAt(timeline, frameId),
      createKeyframe(frameId, transform),
    ];
    this.setTimeline(boneName, newTimeline);
  }

  deleteKeyframe (boneName: BoneName, frameId: number) {
    const timeline = this.getTimeline(boneName);
    this.setTimeline(boneName, removeKeyframeAt(timeline, frameId));
  }

  getKeyframeAt (boneName: BoneName, frameId: number) {
    const timeline = this.getTimeline(boneName);
    return timeline.find(keyframe => keyframe.frameId === frameId);
  }

  moveKeyframeAt (boneName: BoneName, frameId: number, newFrameId: number) {
    const keyframe = this.getKeyframeAt(boneName, frameId);
    if (!keyframe) {
      return; // no keyframe to move
    }

    const newKeyframe = {
      frameId: newFrameId,
      transform: keyframe.transform,
    };

    this.setTimeline(boneName, [ // we could reuse deleteKeyframe/setKeyframeAt, but this is more transactional
      ...removeKeyframeAt(this.getTimeline(boneName), frameId),
      newKeyframe,
    ]);
  }

  duplicateKeyframeAt (boneName: BoneName, frameId: number, newFrameId: number) {
    const keyframe = this.getKeyframeAt(boneName, frameId);
    if (!keyframe) {
      return; // no keyframe to move
    }

    this.setKeyframeAt(boneName, newFrameId, keyframe.transform);
  }

  reset (newState: TimelineMap = TIMELINE_DEFAULT) {
    this.timelines = cloneDeep(newState);
  }

}
