import {BoneConfigEntry, DEFAULT_CFG_VALUES} from './boneConfig';

export const BONE_CONFIG = [

  {
    ...DEFAULT_CFG_VALUES,
    name: 'Armature.001_bRoot',
  } as BoneConfigEntry,

  {
    ...DEFAULT_CFG_VALUES,
    name: 'Armature.001_bLower',
  } as BoneConfigEntry,

  {
    ...DEFAULT_CFG_VALUES,
    name: 'Armature.001_bUpper',
  } as BoneConfigEntry,

  {
    ...DEFAULT_CFG_VALUES,
    name: 'Armature.001_bHead',
  } as BoneConfigEntry,

];

BONE_CONFIG.forEach(c => Object.freeze(c));
