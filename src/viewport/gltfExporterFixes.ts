import {fromValues as vec3_Create} from 'gl-vec3';

// Khronos' official blender gltf exporter is VERY broken.
// VERY, VERY broken, if You check the 'swap Y-up axis' option.
//
// Biggest problem is the rotation of child bones. Blender stores
// rotation (as quat) and separate roll (as real) for each bone.
// This allows for better control with more DOFs. Unfortunately,
// gltf allows only quat.
// But this is just the smallest problem (e.g. local move axis are weird),
// as the rest of rotation (quat) is garbage too.
//
// It all can be verified by using official three.js viewer:
// (https://threejs.org/editor/)
// Normal behaviour of this app without fixes below is same as in three.js,
// that is to say my calculations are ok. Unfortunatley, we have
// to hack this all to work, so..


////////////////////////////////////////////////////////

// Don't even ask
export const MOVE_BONE_AXIS_MODS = vec3_Create(-1, 1, -1);
