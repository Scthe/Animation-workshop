import {isEqual} from 'lodash';
import STATIC_GL from '../gimme_gl';
import {Depth, DepthTest} from './Depth';
import {StencilPerSide, StencilTest, StencilOperation, Stencil} from './Stencil';

/*
 * Following features are not available in webgl:
 *   - lineWidth (https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/lineWidth)
 *   - pointSize
 *   - polygonMode (use GL_LINES during draw?)
 */

export enum CullingMode {
  None = STATIC_GL.NONE, // show all
  CullFront = STATIC_GL.FRONT, // CCW, hides front-facing faces
  CullBack = STATIC_GL.BACK, // CW, hides back-facing faces
}

export class DrawParameters {
  depth: Depth = new Depth();
  stencil: Stencil = new Stencil();
  // Blend blend = new Blend();

  dithering: boolean = false; // smoothen transition between colors
  culling: CullingMode = CullingMode.CullBack;

  // It also affects glClear!
  color_write = [true, true, true, true]; // RGBA
}

//////////////////////////
// apply
//////////////////////////

const setStateBool = (gl: Webgl, name: GLenum, value: boolean) => {
  if (value) {
    gl.enable(name);
  } else {
    gl.disable(name);
  }
};

const syncDepth = (gl: Webgl, depth: Depth, old_depth: Depth, force: boolean) => {
  const doSync = force || !isEqual(depth, old_depth);
  if (!doSync) { return; }

  setStateBool(gl, gl.DEPTH_TEST, depth.test !== DepthTest.AlwaysPass || depth.write);
  gl.depthFunc(depth.test);
  gl.depthMask(depth.write);
};

const isStencilNoop = (settings: StencilPerSide) => {
  const all_noop = settings.opStencilFail === StencilOperation.Keep
               && settings.opstencilPassDepthFail === StencilOperation.Keep
               && settings.opPass === StencilOperation.Keep;
  return all_noop && settings.test === StencilTest.AlwaysPass;
};

const isSameStencilOps = (front: StencilPerSide, back: StencilPerSide) => {
  return front.opStencilFail === back.opStencilFail
      && front.opstencilPassDepthFail === back.opstencilPassDepthFail
      && front.opPass === back.opPass;
};

const syncStencil = (gl: Webgl, newStencil: Stencil, oldStencil: Stencil, force: boolean) => {
  const doSync = force || !isEqual(newStencil, oldStencil);
  if (!doSync) { return; }

  const front = newStencil.front;
  const back = newStencil.back;
  const refValue = newStencil.referenceValue;
  const compareMask = newStencil.compareMask;

  setStateBool(gl, gl.STENCIL_TEST, !isStencilNoop(front) || !isStencilNoop(back));

  // sync test
  if (front.test === back.test) {
    gl.stencilFunc(front.test, refValue, compareMask);
  } else {
    gl.stencilFuncSeparate(gl.FRONT, front.test, refValue, compareMask);
    gl.stencilFuncSeparate(gl.BACK, back.test, refValue, compareMask);
  }

  // sync write mask
  gl.stencilMask(newStencil.writeBytes);

  // sync ops
  if (isSameStencilOps(front, back)) {
    gl.stencilOp(
      front.opStencilFail,
      front.opstencilPassDepthFail,
      front.opPass);
  } else {
    gl.stencilOpSeparate(gl.FRONT,
      front.opStencilFail,
      front.opstencilPassDepthFail,
      front.opPass);
    gl.stencilOpSeparate(gl.BACK,
      back.opStencilFail,
      back.opstencilPassDepthFail,
      back.opPass);
  }
};

export const applyDrawParams = (gl: Webgl, dp: DrawParameters, oldDP: DrawParameters, force: boolean = false) => {
  syncDepth(gl, dp.depth, oldDP ? oldDP.depth : undefined, force);
  syncStencil(gl, dp.stencil, oldDP ? oldDP.stencil : undefined, force);
  // syncBlend(gl, dp.blend, oldDP.blend);

  if (force || dp.dithering !== oldDP.dithering) {
    setStateBool(gl, gl.DITHER, dp.dithering);
  }

  if (force || dp.culling !== oldDP.culling) {
    if (dp.culling === CullingMode.None) { // no, there is no leak here
      setStateBool(gl, gl.CULL_FACE, false);
    } else {
      setStateBool(gl, gl.CULL_FACE, true);
      gl.cullFace(dp.culling);
    }
  }

  // color write
  const colorWriteChanged =
    force ||
    oldDP.color_write[0] !== dp.color_write[0] ||
    oldDP.color_write[1] !== dp.color_write[1] ||
    oldDP.color_write[2] !== dp.color_write[2] ||
    oldDP.color_write[3] !== dp.color_write[3];
  if (colorWriteChanged) {
    const mask = dp.color_write;
    gl.colorMask(mask[0], mask[1], mask[2], mask[3]);
  }
};
