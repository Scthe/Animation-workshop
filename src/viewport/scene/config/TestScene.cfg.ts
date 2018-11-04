import {ALLOW_ALL, DISALLOW_ALL} from './constraints';
import {BoneConfigEntry, DEFAULT_CFG_VALUES} from './boneConfig';

export const BONE_CONFIG = [

  {
    ...DEFAULT_CFG_VALUES,
    name: 'SkeletonTest_rig_B_root',
    constraints: {
      position: ALLOW_ALL,
      rotation: ALLOW_ALL,
      scale:    DISALLOW_ALL,
    },
  } as BoneConfigEntry,

  {
    ...DEFAULT_CFG_VALUES,
    name: 'SkeletonTest_rig_B_1',
    constraints: {
      position: ALLOW_ALL,
      rotation: ALLOW_ALL, // allowOnly(Axis.AxisY),
      scale:    DISALLOW_ALL,
    },
  } as BoneConfigEntry,

  {
    ...DEFAULT_CFG_VALUES,
    name: 'SkeletonTest_rig_B_2',
    constraints: {
      position: ALLOW_ALL,
      rotation: ALLOW_ALL, // allowOnly(Axis.AxisY),
      scale:    DISALLOW_ALL,
    },
  } as BoneConfigEntry,

];

BONE_CONFIG.forEach(c => Object.freeze(c));
