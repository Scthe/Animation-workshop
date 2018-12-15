import {vec2, fromValues as vec2_Create} from 'gl-vec2';
import {
  vec3, create as vec3_0, fromValues as vec3_Create,
  scale, add, subtract, dot, distance
} from 'gl-vec3';
import {mat4, create as mat4_Create, invert} from 'gl-mat4';
import {subtractNorm, transformPointByMat4} from 'gl-utils';


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
  const rayOrigin = transformPointByMat4(p0, vpInverse, false);
  const rayEnd    = transformPointByMat4(p1, vpInverse, false);

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

/** Find closest point to 'p' that also lies on the specified ray */
export const projectPointOntoRay = (p: vec3, ray: Ray) => {
  // dot op that we are going to use ignores ray.origin and uses (0,0,0)
  // as ray start. Subtract here from p to move to same space
  const p2 = subtract(vec3_0(), p, ray.origin);

  // this is from the geometric definition of dot product
  const dist = dot(p2, ray.dir);
  const offset = scale(vec3_0(), ray.dir, dist);
  return add(vec3_0(), ray.origin, offset);
};


/** are p0, p1 on same 'side' of ray direction? */
export const getDirectionModifier = (ray: Ray, p0: vec3, p1: vec3) => {
  const v2 = subtractNorm(p1, p0);
  return dot(ray.dir, v2) >= 0 ? 1 : -1;
};

const pointToRayDistance = (p: vec3, ray: Ray): number => {
  const projected = projectPointOntoRay(p, ray);
  return distance(p, projected);
};

interface Sphere {
  origin: vec3;
  radius: number;
}

export const sphereIntersect = (ray: Ray, sphere: Sphere) =>
  pointToRayDistance(sphere.origin, ray) <= sphere.radius;
