export * from './DrawParams';
export * from './DrawParams/Depth';
export * from './DrawParams/Stencil';
export * from './createContext';
export * from './Shader';
export * from './uniforms';
export * from './vao';
import { fromValues as vec3_Create, vec3 } from 'gl-vec3';
import { fromValues as vec2_Create, vec2 } from 'gl-vec2';
import { mat4 } from 'gl-mat4';

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

const dot = (a: vec3, b: vec3) => {
  return (
    a[0] * b[0] +
    a[1] * b[1] +
    a[2] * b[2]);
};

export const transformPointByMat4 = (out: vec3, inVec_: vec3, m: mat4) => {
  const inVec = vec3_Create(inVec_[0], inVec_[1], inVec_[2]); // prevent aliasing
  const col1 = vec3_Create(m[0], m[4], m[8] );
  const col2 = vec3_Create(m[1], m[5], m[9] );
  const col3 = vec3_Create(m[2], m[6], m[10]);
  const col4 = vec3_Create(m[3], m[7], m[11]);

  let w = dot(inVec, col4) + m[15];
  w = w === 0 ? 1.0 : w;

  out[0] = (dot(inVec, col1) + m[12]) / w;
  out[1] = (dot(inVec, col2) + m[13]) / w;
  out[2] = (dot(inVec, col3) + m[14]) / w;
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
