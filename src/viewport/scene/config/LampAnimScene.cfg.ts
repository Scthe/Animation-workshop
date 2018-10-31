import {ALLOW_ALL, DISALLOW_ALL} from './constraints';
import {POS_ROT_SCALE_0} from 'viewport/animation';
import {BoneConfigEntry} from './index';

export const BONE_CONFIG = [

  {
    name: 'SkeletonTest_rig_B_2',
    keyframe0: POS_ROT_SCALE_0,
    constraints: {
      position: ALLOW_ALL,
      rotation: ALLOW_ALL, // allowOnly(Axis.AxisY),
      scale:    DISALLOW_ALL,
    },
  } as BoneConfigEntry,

];

BONE_CONFIG.forEach(c => Object.freeze(c));
