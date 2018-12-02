import {
  generateTorus, generateCone, generateDonut,
  addHeight, combineShapes, createGpuShape,
  Shader,
} from 'gl-utils';

const SHADER_ATTR_NAME = 'a_Position';

export const generateMoveGizmo = (gl: Webgl, shader: Shader) => {
  const shape = generateTorus({
    radius: 0.01,
    height: 0.9,
    segments: 5,
  });
  const shape2 = generateCone({
    radius: 0.05,
    height: 0.2,
    segments: 32,
  });
  shape2.vertices = shape2.vertices.map(addHeight(0.8));

  return {
    ...createGpuShape(gl, combineShapes(shape, shape2), shader, SHADER_ATTR_NAME),
    material: undefined as any,
  };
};

export const generateRotateGizmo = (gl: Webgl, shader: Shader) => {
  const shape = generateDonut({
    radius: 1.0,
    crosscutRadius: 0.01,
    segments: 64,
    crosscutSegments: 5,
  });
  return {
    ...createGpuShape(gl, shape, shader, SHADER_ATTR_NAME),
    material: undefined as any,
  };
};
