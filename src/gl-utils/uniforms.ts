import keys from 'lodash-es/keys';
import {Shader} from './Shader';

// https://github.com/greggman/twgl.js/blob/master/src/programs.js#L316
// https://github.com/floooh/altai/blob/master/src/altai.ts#L557

const createVectorSetter = (fnName: string) => (gl: Webgl, location: GLint, value: any) => {
  (gl as any)[fnName](location, value);
};

const createMatrixSetter = (fnName: string) => (gl: Webgl, location: GLint, value: any) => {
  (gl as any)[fnName](location, false, value);
};

const getUniformSetter = (gl: Webgl, type: GLenum) => {
  switch (type) {
    case gl.FLOAT:      return createVectorSetter('uniform1f');
    case gl.FLOAT_VEC2: return createVectorSetter('uniform2fv'); // Float32Array
    case gl.FLOAT_VEC3: return createVectorSetter('uniform3fv');
    case gl.FLOAT_VEC4: return createVectorSetter('uniform4fv');
    case gl.INT:      return createVectorSetter('uniform1i');
    case gl.INT_VEC2: return createVectorSetter('uniform2iv'); // Int32Array
    case gl.INT_VEC3: return createVectorSetter('uniform3iv');
    case gl.INT_VEC4: return createVectorSetter('uniform4iv');
    case gl.FLOAT_MAT2: return createMatrixSetter('uniformMatrix2fv');
    case gl.FLOAT_MAT3: return createMatrixSetter('uniformMatrix3fv');
    case gl.FLOAT_MAT4: return createMatrixSetter('uniformMatrix4fv');
  }
};

const unknownUniform = (name: string) =>
  `Uniform '${name}' was not found, all uniforms ` +
  'for this call of setUniforms have forced validation ON';

const unrecognisedType = (name: string, type: GLenum) =>
  `Uniform '${name}' has not recognised type ${type}, ` +
  'all uniforms for this call of setUniforms have forced validation ON';

type UniformValues = {[name: string]: any};

export const setUniforms = (gl: Webgl, shader: Shader, uniforms: UniformValues, forceAll = false) => {
  const setUniform = (name: string) => {
    const shaderUniform = shader.getUniform(name);
    if (!shaderUniform) {
      if (forceAll) { throw unknownUniform(name); }
      return;
    }

    const setter = getUniformSetter(gl, shaderUniform.type);
    if (!setter) {
      if (forceAll) { throw unrecognisedType(name, shaderUniform.type); }
      return;
    }

    const value = uniforms[name];
    setter.call(null, gl, shaderUniform.location, value);
  };

  keys(uniforms).forEach(setUniform);
};
