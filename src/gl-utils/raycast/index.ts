import {vec2, fromValues as vec2_Create} from 'gl-vec2';
import {
  vec3, create as vec3_0, fromValues as vec3_Create,
  cross, dot, scale, add
} from 'gl-vec3';
import {mat4, create as mat4_Create, invert} from 'gl-mat4';
import {subtractNorm, transformPointByMat4} from 'gl-utils';


//////////////
/// Ray
//////////////

export interface Ray {
  origin: vec3;
  dir: vec3;
}

interface CameraDesc {
  viewport: {width: number, height: number};
  viewProjMat: mat4;
}

// http://nelari.us/post/gizmos/
/** Given camera settings and pixel position, calculate ray */
export const generateRayFromCamera = (camera: CameraDesc, mousePosPx: vec2) => {
  const {viewProjMat: vp} = camera;
  const {width, height} = camera.viewport;

  let mousePosNDC = vec2_Create(mousePosPx[0] / width, mousePosPx[1] / height);
  mousePosNDC[0] = mousePosNDC[0] * 2 - 1;
  mousePosNDC[1] = (1 - mousePosNDC[1]) * 2 - 1;

  const vpInverse = invert(mat4_Create(), vp);
  const p0 = vec3_Create(mousePosNDC[0], mousePosNDC[1], 0); // zMin = 0
  const p1 = vec3_Create(mousePosNDC[0], mousePosNDC[1], 1); // zMax = 1, does not matter, just get `dir`
  const rayOrigin = transformPointByMat4(vec3_0(), p0, vpInverse);
  const rayEnd    = transformPointByMat4(vec3_0(), p1, vpInverse);

  return {
    origin: rayOrigin,
    dir: subtractNorm(rayEnd, rayOrigin),
  } as Ray;
};

/** Move `t` along ray from origin and return point */
export const getPointFromRay = (ray: Ray, t: number) => {
  const offset = scale(vec3_0(), ray.dir, t);
  return add(vec3_0(), ray.origin, offset);
};


//////////////
/// Plane
//////////////

export interface Plane {
  normal: vec3;
  d: number;
}

/**
 * Assuming infinte plane, get intersection, where ray crosses the plane. returns t for ray
 * @see https://stackoverflow.com/questions/23975555/how-to-do-ray-plane-intersection
 * @see https://www.cs.princeton.edu/courses/archive/fall00/cs426/lectures/raycast/sld017.htm
 */
export const planeRayIntersectionDistance = (plane: Plane, ray: Ray) => {
  const nom = plane.d + dot(ray.origin, plane.normal);
  const denom = dot(ray.dir, plane.normal); // project to get how fast we closing in
  return -nom / denom;
};

/** Assuming infinte plane, get intersection, where ray crosses the plane. returns 3d point */
export const planeRayIntersection = (plane: Plane, ray: Ray) => {
  const t = planeRayIntersectionDistance(plane, ray);
  return getPointFromRay(ray, t);
};


/** Given plane normal and point that lies on the plane, calculate plane's `d` */
export const getPlane_d = (n: vec3, point: vec3) => dot(n, point);


/**
 * We want plane that:
 *  - contains point `p`
 *  - has normal perpendicular to `axis`
 *  - is perpendicular to camera
 */
export const createPlaneAroundAxisAndTowardCamera = (axis: vec3, p: vec3, camera: vec3) => {
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
