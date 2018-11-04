import {fromValues as vec3_Create} from 'gl-vec3';
import {create as mat4_Create, fromScaling} from 'gl-mat4';
import {Axis} from 'gl-utils';
import {FrameEnv} from 'viewport/main';

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

// We are using custom bind matrices, which means that we have to fix
// some issues with how blender exports positions.
// If we use bind matrices from blender exporter, the model is
// flipped on x-axis (and some other weird issues)
//
// All this is similar to left/right-hand coordinate system conversion
export const BIND_MATRIX_FIX = fromScaling(mat4_Create(), vec3_Create(-1, 1, 1));


////////////////////////////////////////////////////////


/// swap rotation axis cause blender gltf exporter...
/// (literary after clicking on rotate Axis.Y we will
///  rotate on Axis.X and it will look good)
// export const fixGltfExporterRotationAxis = (axis: Axis, frameEnv: FrameEnv) => {
  // const {selectedObjectCfg} = frameEnv;
  // return selectedObjectCfg.blenderExporterRotationAxisFix[axis];
// };
