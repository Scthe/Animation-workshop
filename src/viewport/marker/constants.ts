import {hexToVec3} from 'gl-utils';

export const COLOR_BONE = hexToVec3('#7a3ab9');
export const COLOR_BONE_SELECTED = hexToVec3('#935ac6');
export const COLOR_GIZMO = hexToVec3('#b93a46'); // actually, will use per-axis colors;
export const COLOR_DEBUG = hexToVec3('#4fee55');

const RADIUS_NORMAL = 0.1;
const RADIUS_SMALL = 0.05;
const RADIUS_TINY = 0.02;
export type MarkerRadiusType = 'normal' | 'small' | 'tiny';

export const getRadiusValue = (str?: MarkerRadiusType) => {
  switch (str) {
    case 'small': return RADIUS_SMALL;
    case 'tiny': return RADIUS_TINY;
    default: return RADIUS_NORMAL;
  }
};
