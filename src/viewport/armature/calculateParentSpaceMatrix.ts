import {mat4, create as mat4_Create, multiply} from 'gl-mat4';
import {create as vec3_Create, add} from 'gl-vec3';
import {create as quat_Create, multiply as qMul} from 'gl-quat';
import {AnimTimings} from 'viewport/animation';
import {getMove, getRotation} from '../../UI_Bridge';
import {Armature, Bone} from './index';
import {createModelMatrix} from 'gl-utils';


// our goal is to transplant parent rotation matrix onto bone position.
// yep, you've heard it right
//
// reason is as follows: child matrix applies rotation on top of parent matrix.
// So we can't show gizmo based on child matrix, as this is the thing that we
// will calculate (and change during gizmo-drag rotation)
//
// NOTE: while theory sounds fine, the impl. below is massive hack


// EXPL: current gizmo is how local space transforms are,
//       but rotations are in parent space

// TODO calc rotation boneRot->parentRot and apply
// TOOD just skip last step of calculateFrameMatrix?
// TODO or fix rotation to use bone local space, not parent space? (not add transform, multiply bind by animation)


/* Version 1
const boneMatrix = bone.getFrameMatrix(armature);
const parentBoneMatrix = bone.getParentFrameMatrix(armature);

const matRotParent = fromMat4(mat4_Create(), parentBoneMatrix);
const qRotParent = fromMat3(quat_Create(), matRotParent);

return boneMatrix;
*/

/* Version 2
return bone.$_frameParentTransformCache;
*/

/*
const calculateParentSpaceMatrix = (bone: Bone, frameEnv: FrameEnv) => {
  const armature = frameEnv.scene.lamp.bones;


  const parent = bone.getParent(armature);
  const parentTransfrom = parent ? parent.$_frameParentTransformCache : mat4_Create();

  const animationTransform = mat4_Create(); // TODO
  const offsetWorld = transformPointByMat4(bone.$frameRotMatrix, bone.translation, true);

  const globalTransform = mat4_Create();
  const finalMat = mat4_Create();
  multiply(globalTransform, parentTransfrom, animationTransform);

  multiply(finalMat, globalTransform, bone.data.inverseBindMatrix);

  return finalMat;
};
*/
