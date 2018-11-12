import {vec3, create as vec3_0, cross, dot} from 'gl-vec3';
import {subtractNorm} from 'gl-utils';
import {Ray, getPointFromRay} from './Ray';


export interface Plane {
  normal: vec3;
  d: number;
}

/**
 * Assuming infinte plane, get intersection, where ray crosses the plane. returns t for ray
 * @see https://stackoverflow.com/questions/23975555/how-to-do-ray-plane-intersection
 * @see https://www.cs.princeton.edu/courses/archive/fall00/cs426/lectures/raycast/sld017.htm
 */
const planeRayIntersectionDistance = (plane: Plane, ray: Ray) => {
  const nom = plane.d + dot(ray.origin, plane.normal);
  const denom = dot(ray.dir, plane.normal); // project to get how fast we closing in
  return -nom / denom;
};

/** Assuming infinte plane, get intersection where ray crosses the plane. returns 3d point */
export const planeRayIntersection = (plane: Plane, ray: Ray) => {
  const t = planeRayIntersectionDistance(plane, ray);
  return getPointFromRay(ray, t);
};


/** Given plane normal and point that lies on the plane, calculate plane's `d` */
const getPlane_d = (n: vec3, point: vec3) => -dot(n, point);


/**
 * We want plane that:
 *  - contains point `p`
 *  - has normal perpendicular to `axis`
 *  - is perpendicular to camera
 *
 * NOTE: this is VERY iffy, but kinda works, which is good enough
 */
export const createPlaneAroundAxisAndTowardCamera = (ray: Ray, camera: vec3) => {
  const {origin: p, dir: axis} = ray;
  const toCamera = subtractNorm(camera, p);

  // do cross twice - usuall thing to create plane normal
  // (plane includes rotation axis and is perpendicular to camera)
  const tangent = cross(vec3_0(), axis, toCamera);
  const planeNormal = cross(vec3_0(), tangent, axis);
  return {
    normal: planeNormal,
    d: getPlane_d(planeNormal, p)
  } as Plane;
};


/**
 * Plane containg 'p' with normal toward 'target'
 *
 * NOTE: In practice, this function is a bit unstable, use
 *       'createPlaneAroundAxisAndTowardCamera' instead
 */
export const createPlaneTowardPoint = (target: vec3, p: vec3) => {
  const toTarget = subtractNorm(target, p);

  return {
    normal: toTarget,
    d: getPlane_d(toTarget, p)
  } as Plane;
};
