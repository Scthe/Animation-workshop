import {Constraints, ALLOW_ALL, DISALLOW_ALL} from './constraints';
import {Transform, POS_ROT_SCALE_0} from 'viewport/animation';

export {isAxisAllowed, isAnyAxisAllowed} from './constraints';


// this module contains descriptor of scene.
// tightly coupled to .glb file.
// we have to specify constraints, default frame etc.

import {BONE_CONFIG} from './TestScene.cfg';
// import {BONE_CONFIG} from './LampAnimScene.cfg';


export interface BoneConfigEntry {
  name: string;
  keyframe0: Transform; // default values
  constraints: Constraints;
}

const DEFAULT_CFG_VALUES = {
  name: 'bone-not-found',
  keyframe0: POS_ROT_SCALE_0,
  constraints: {
    position: ALLOW_ALL,
    rotation: ALLOW_ALL,
    scale:    DISALLOW_ALL,
  },
} as BoneConfigEntry;


// I'd rather not expose content of this file as gigantic JSON
export const getBoneConfig = (boneName: string) => {
  return BONE_CONFIG.find(c => c.name === boneName) || DEFAULT_CFG_VALUES;
};
