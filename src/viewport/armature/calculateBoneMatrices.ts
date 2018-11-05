import {mat4, create as mat4_Create, multiply} from 'gl-mat4';
import {AnimTimings} from 'viewport/animation';
import {getMove, getRotation} from '../../UI_Bridge';
import {Armature, Bone} from './index';
import {convertTransformToMatrix, Transform, SCALE_0} from 'gl-utils';

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

const getAnimTransform = (bone: Bone) => {
  const marker = {name: bone.name} as any;
  return {
    position: getMove(marker),
    rotation: getRotation(marker),
    scale: SCALE_0,
  } as Transform;
};


/**
 * This, along with gizmo handler control transformation space.
 */
const calculateAnimTransformMat = (bone: Bone, animTransfrom: Transform) => {
  const bindMat = convertTransformToMatrix(bone.data.bindTransform);
  const animMat = convertTransformToMatrix(animTransfrom);
  return multiply(mat4_Create(), bindMat, animMat);
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
const calculateBone = (bones: Armature, boneId: number, parentTransfrom: mat4) => {
  const bone = bones[boneId] as Bone;
  const {globalTransform, finalBoneMatrix} = bone.getFrameCache();

  // transform for current frame
  const animTransfrom = getAnimTransform(bone);
  const animationTransformMat = calculateAnimTransformMat(bone, animTransfrom);

  multiply(globalTransform, parentTransfrom, animationTransformMat);
  multiply(finalBoneMatrix, globalTransform, bone.data.inverseBindMatrix);

  bone.children.forEach(childIdx => {
    calculateBone(bones, childIdx, globalTransform);
  });
};

export const calculateBoneMatrices = (_: AnimTimings, bones: Armature) => {
  calculateBone(bones, 0, mat4_Create());
};
