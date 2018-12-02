import {Transform, POS_ROT_SCALE_0} from 'gl-utils';
import {Constraints, ALLOW_ALL, DISALLOW_ALL} from './constraints';

export const DEFAULT_CONSTRAINTS: Constraints = {
  position: ALLOW_ALL,
  rotation: ALLOW_ALL,
  scale:    DISALLOW_ALL,
};

export const createConstraints = (values: Partial<Constraints>): Constraints => ({
  ...DEFAULT_CONSTRAINTS,
  ...values,
});


export interface BoneConfigEntry {
  name: string;
  keyframe0: Transform; // default values
  constraints: Constraints;
}

export const DEFAULT_CFG_VALUES: BoneConfigEntry = {
  name: 'bone-not-found',
  keyframe0: POS_ROT_SCALE_0,
  constraints: DEFAULT_CONSTRAINTS,
};
