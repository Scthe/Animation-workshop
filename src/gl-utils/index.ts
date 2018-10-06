import {fromValues as vec4_Create, dot as dot4} from 'gl-vec4';
import {vec3, fromValues as vec3_Create, create as vec3_0, normalize, subtract} from 'gl-vec3';
import {vec2, fromValues as vec2_Create} from 'gl-vec2';
import {quat} from 'gl-quat';
import {
  mat4, create as mat4_Create,
  multiply,
  fromRotationTranslation, fromTranslation, fromScaling
} from 'gl-mat4';

export * from './DrawParams';
export * from './DrawParams/Depth';
export * from './DrawParams/Stencil';
export * from './createContext';
export * from './Shader';
export * from './uniforms';
export * from './vao';
export * from './axis';
export * from './shapes';

// https://github.com/KhronosGroup/WebGLDeveloperTools/blob/master/src/debug/webgl-debug.js#L492

// no. of bytes in each primitive type
export const BYTES = {
  FLOAT: 4,
  INT: 4,
  SHORT: 2
};

// call this in render loop, adjust viewport too!
// gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
// @see https://webgl2fundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
export const handleResize = (gl: Webgl) => {
  const canvas = gl.canvas;
  const displayWidth  = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  if (canvas.width  !== displayWidth ||
      canvas.height !== displayHeight) {
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }

  return {width: displayWidth, height: displayHeight};
};

export const requestAnimFrame = ((window: any) => {
  const FPS_MANUAL_MODE = 30; // let's be serious, this line will never execute
  const omgWhyIsItNotSupported = (callback: Function, element: HTMLElement) => {
    window.setTimeout(callback, 1000 / FPS_MANUAL_MODE);
  };

  let fn =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    omgWhyIsItNotSupported;
  return fn.bind(window);
})(window);

export const toRadians = (degrees: number) => degrees * Math.PI / 180;

export const transformPointByMat4 = (out: vec3, inVec_: vec3, m: mat4) => {
  const inVec = vec4_Create(inVec_[0], inVec_[1], inVec_[2], 1.0); // prevent aliasing
  const col1 = vec4_Create(m[0], m[4], m[8] , m[12] );
  const col2 = vec4_Create(m[1], m[5], m[9] , m[13] );
  const col3 = vec4_Create(m[2], m[6], m[10], m[14]);
  const col4 = vec4_Create(m[3], m[7], m[11], m[15]);

  let w = dot4(inVec, col4);
  w = w === 0 ? 0.0001 : w; // prevent divide by 0

  out[0] = dot4(inVec, col1) / w;
  out[1] = dot4(inVec, col2) / w;
  out[2] = dot4(inVec, col3) / w;
  return out;
};

export const lerp = (a: number, b: number, time: number) => {
  return (1 - time) * a + time * b;
};

export const hexToVec3 = (hex: number | string) => {
  if (typeof hex === 'string') {
    const hexStr = hex[0] === '#' ? hex.substr(1) : hex;
    hex = parseInt(hexStr, 16);
  }

  // const a = (hex >> 24) & 0xff;
  const r = (hex >> 16) & 0xff;
  const g = (hex >>  8) & 0xff;
  const b = (hex      ) & 0xff;
  return vec3_Create(r / 255, g / 255, b / 255);
};

export const NDCtoPixels = (pos: vec2, width: number, height: number, reverseHeight = false) => {
  // convert chain: [-1, 1] => [0, 2] => [0, 1] => [0, w]
  const x = (pos[0] + 1) / 2 * width;
  const y = (pos[1] + 1) / 2 * height;
  return vec2_Create(x, reverseHeight ? height - y : y);
};

export const createModelMatrix = (pos: vec3, rotation: quat | mat4, scale: number) => {
  let rotationMoveMat = mat4_Create();

  if (rotation.length === 4) { // if is quat, not mat4
    fromRotationTranslation(rotationMoveMat, rotation, pos);
  } else {
    const moveMat = mat4_Create();
    fromTranslation(moveMat, pos);
    multiply(rotationMoveMat, moveMat, rotation);
  }

  const scaleMat = mat4_Create();
  fromScaling(scaleMat, vec3_Create(scale, scale, scale));

  const result = mat4_Create();
  return multiply(result, rotationMoveMat, scaleMat);
};

export const getMVP = (m: mat4, v: mat4, p: mat4) => {
  const vp = mat4_Create();
  const mvp = mat4_Create();
  multiply(vp, p, v);
  multiply(mvp, vp, m);
  return mvp;
};

export const getDist2 = (a: vec2, b: vec2, doSqrt = false) => {
  const delta = [a[0] - b[0], a[1] - b[1]];
  const res = delta[0] * delta[0] + delta[1] * delta[1];
  return doSqrt ? Math.sqrt(res) : res;
};

export const subtractNorm = (a: vec3, b: vec3) => normalize(vec3_0(), subtract(vec3_0(), a, b));
