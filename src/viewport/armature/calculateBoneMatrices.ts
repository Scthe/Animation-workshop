import {mat4, create as mat4_Create, multiply} from 'gl-mat4';
import {create as vec3_Create, add} from 'gl-vec3';
import {create as quat_Create, multiply as qMul} from 'gl-quat';
import {AnimTimings} from 'viewport/animation';
import {getMove, getRotation} from '../../UI_Bridge';
import {Armature, Bone} from './index';
import {createModelMatrix} from 'gl-utils';

/*
 *  In this file we update bone matrices for animation.
 *
 *  NOTE: 'bind' always refers to bind pose (e.g. T-pose)
 *
 *  Nice math overviews:
 *    * http://ogldev.atspace.co.uk/www/tutorial38/tutorial38.html
 *    * https://www.reddit.com/r/opengl/comments/4pu7hq/question_about_skeletal_animations/
 *    * https://youtu.be/F-kcaonjHf8?t=3m23s
 */

// some util struct to ease moving params
interface BoneTransformsCfg {
  animState: AnimTimings;
  bones: Armature;
}

// get animation matrix for bone
/*const getAnimationTransform = (cfg: BoneTransformsCfg, boneId: number) => {
  const bone = cfg.bones[boneId];
  const boneData = bone.data;
  const marker = {name: bone.name} as any;

  const deltaFromAnim = getMove(marker);
  const translation = add(vec3_Create(), boneData.translation, deltaFromAnim);

  const qAnim = getRotation(marker);
  const rotation = qMul(quat_Create(), qAnim, boneData.rotation);

  const scale = 1.0;
  return createModelMatrix(translation, rotation, scale);
};
*/

const getAnimationTransform = (cfg: BoneTransformsCfg, boneId: number) => {
  const bone = cfg.bones[boneId];
  const boneData = bone.data;
  const marker = {name: bone.name} as any;

  const translation = getMove(marker);
  const rotation = getRotation(marker);
  const scale = 1.0;
  /*
  // const translation = add(vec3_Create(), boneData.translation, deltaFromAnim);
  // const rotation = qMul(quat_Create(), qAnim, boneData.rotation);

  // return createModelMatrix(translation, rotation, scale);
  const animMat = createModelMatrix(translation, rotation, scale);
  */
  const bindMat = createModelMatrix(translation, rotation, scale);
  const animMat = createModelMatrix(boneData.translation, boneData.rotation, scale);

  return multiply(mat4_Create(), animMat, bindMat);
  // return multiply(mat4_Create(), bindMat, animMat);
};

/*
 * calculate bone and children (recursively)
 *
 * matrices order:
 * 1. inverseBindMatrix - bring vertices to bone's local space
 *      In other words transformation: bindPosition->(0,0,0).
 *      In implementation, combination of BONE_BIND_MATRIX and PARENT'S_BONE_BIND_MATRIX.
 *      NOTE: this resets the bone's rotation to identity (straight up usually)
 * 2. animationTransform - current local transform for this animation frame.
 *      if identity is given here, bone will land at (0,0,0) with no rotation.
 *      'true' identity is achieved if bind matrix is given here.
 *      In other words, this matrix must move from (0,0,0) to expected bone
 *      [position/rotaton/scale]-localSpace
 * 3. parentTransfrom - this acts as (0,0,0)->finalPosition.
 *      e.g. You rotated the character's shoulder With animationTransform,
 *      now we have to move the shoulder from (0,0,0) to proper position
 *      relative to spine (where spine is parent bone).
 *      Look up how we calculated inverseBindMatrix
 *      NOTE: parentTransfrom is waht makes the animation propagate down the
 *      children
 *
 * In following implementation the multiplication order is reversed cause OpenGL
 */
const calculateBone = (cfg: BoneTransformsCfg, boneId: number, parentTransfrom: mat4) => {
  const bone = cfg.bones[boneId] as Bone;
  const {parentGlobalTransform: globalTransform, finalBoneMatrix} = bone.getFrameCache();

  // transform for current frame
  const animationTransform = getAnimationTransform(cfg, boneId);

  multiply(globalTransform, parentTransfrom, animationTransform);
  multiply(finalBoneMatrix, globalTransform, bone.data.inverseBindMatrix);

  bone.children.forEach(childIdx => {
    calculateBone(cfg, childIdx, globalTransform);
  });
};

export const calculateBoneMatrices = (animState: AnimTimings, bones: Armature) => {
  const cfg = { animState, bones, };
  calculateBone(cfg, 0, mat4_Create());
};



/*
const getAnimationTransform = (cfg: BoneTransformsCfg, boneId: number) => {
  // Interpolate scaling and generate scaling transformation matrix
  aiVector3D Scaling;
  CalcInterpolatedScaling(Scaling, AnimationTime, pNodeAnim);
  Matrix4f ScalingM;
  ScalingM.InitScaleTransform(Scaling.x, Scaling.y, Scaling.z);

  // Interpolate rotation and generate rotation transformation matrix
  aiQuaternion RotationQ;
  CalcInterpolatedRotation(RotationQ, AnimationTime, pNodeAnim);
  Matrix4f RotationM = Matrix4f(RotationQ.GetMatrix());

  // Interpolate translation and generate translation transformation matrix
  aiVector3D Translation;
  CalcInterpolatedPosition(Translation, AnimationTime, pNodeAnim);
  Matrix4f TranslationM;
  TranslationM.InitTranslationTransform(Translation.x, Translation.y, Translation.z);

  // Combine the above transformations
  return TranslationM * RotationM * ScalingM;
}
*/
