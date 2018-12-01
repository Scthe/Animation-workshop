import {fromValues as vec3_Create} from 'gl-vec3';
export {isAxisAllowed, isAnyAxisAllowed} from './constraints';
export {BoneConfigEntry} from './boneConfig';

// TODO clean up this file

/// SCENE

// test object: simple mesh to test skinning
// export const GLTF_URL = require('assets/TestScene.glb');
// export const LAMP_ROOT_NODE = 'SkeletonTest_rig';
// import {BONE_CONFIG} from './TestScene.cfg';

// export const GLTF_URL = require('assets/LampAnimScene.old.glb');

// final object
export const GLTF_URL = require('assets/LampAnimScene.glb');
export const SCENE_OBJECTS = ['LampObj'];
// export const SCENE_OBJECTS = ['LampObj', 'BallObj'];
import {BONE_CONFIG} from './LampAnimScene.cfg';

/// END: SCENE


import {getBoneConfig as getBoneConfig_} from './boneConfig';
export const getBoneConfig = getBoneConfig_(BONE_CONFIG);


export const SHADERS = {
  LAMP_VERT: require('shaders/lampShader.vert.glsl'),
  LAMP_FRAG: require('shaders/lampShader.frag.glsl'),
  MARKER_VERT: require('shaders/marker.vert.glsl'),
  MARKER_FRAG: require('shaders/marker.frag.glsl'),
  GIZMO_VERT: require('shaders/gizmo.vert.glsl'),
  GIZMO_FRAG: require('shaders/lampShader.frag.glsl'),
  GRID_VERT: require('shaders/grid.vert.glsl'),
  GRID_FRAG: require('shaders/grid.frag.glsl'),
};


export const CAMERA_SETTINGS = {
  fovDgr: 90,
  zNear: 0.1,
  zFar: 100,
};
export const CAMERA_POSITION = vec3_Create(0, 1, 2);
