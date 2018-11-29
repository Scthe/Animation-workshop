import {mat4, create as mat4_Create, multiply} from 'gl-mat4';
import {Armature, Bone} from './index';
import {convertTransformToMatrix, Transform} from 'gl-utils';

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


/**
 * This, along with gizmo handler control transformation space.
 */
const calculateAnimTransformMat = (bone: Bone, animTransform: Transform) => {
  const bindMat = convertTransformToMatrix(bone.data.bindTransform);
  const animMat = convertTransformToMatrix(animTransform);
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
 * 3. parentTransform - this acts as (0,0,0)->finalPosition.
 *      e.g. You rotated the character's shoulder With animationTransform,
 *      now we have to move the shoulder from (0,0,0) to proper position
 *      relative to spine (where spine is parent bone).
 *      Look up how we calculated inverseBindMatrix
 *      NOTE: parentTransform is what makes the animation propagate down the
 *      children
 *
 * In following implementation the multiplication order is reversed cause OpenGL
 */
const calculateBone = (bones: Armature, boneId: number, parentTransform: mat4) => {
  const bone = bones[boneId] as Bone;
  const {globalTransform, finalBoneMatrix} = bone.getFrameCache(); // aliases

  // transform for current frame (interpolated keyframes + gizmo dragging)
  const {animationTransform} = bone.getFrameCache();
  const animationTransformMat = calculateAnimTransformMat(bone, animationTransform);

  multiply(globalTransform, parentTransform, animationTransformMat);
  multiply(finalBoneMatrix, globalTransform, bone.data.inverseBindMatrix);

  bone.children.forEach(childIdx => {
    calculateBone(bones, childIdx, globalTransform);
  });
};

const BONE_ROOT_INDEX = 0;

export const calculateBoneMatrices = (bones: Armature) => {
  calculateBone(bones, BONE_ROOT_INDEX, mat4_Create());
};
