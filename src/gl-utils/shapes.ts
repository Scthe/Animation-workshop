import {vec3, fromValues as vec3_Create} from 'gl-vec3';
import {Shader, Vao, VaoAttrInit} from './index';
import flatten from 'lodash-es/flatten';

// alias for nicer semantic
const vert = (x: number, y: number, z: number) => vec3_Create(x, y, z) as Vertex;

type Vertex = vec3;

interface TriangleIndices {
  a: number;
  b: number;
  c: number;
}

export interface Shape {
  vertices: Vertex[];
  indices: TriangleIndices[];
}

export const combineShapes = (...shapes: Shape[]) => {
  const vertices = [] as Vertex[];
  const indices = [] as TriangleIndices[];

  let vertexOffset = 0;
  shapes.forEach(shape => {
    vertices.push(...shape.vertices);

    const addOffset = (triangle: TriangleIndices) => ({
      a: triangle.a + vertexOffset,
      b: triangle.b + vertexOffset,
      c: triangle.c + vertexOffset,
    } as TriangleIndices);

    indices.push(...shape.indices.map(addOffset));
    vertexOffset += shape.vertices.length;
  });

  return { vertices, indices, } as Shape;
};

export const createGpuShape = (gl: Webgl, shape: Shape, shader: Shader, attrName: string) => {
  const {vertices, indices} = shape;

  // vertices
  const vertBuf = new Float32Array(vertices.length * 3);
  vertices.forEach((v: Vertex, i: number) => {
    vertBuf[i * 3 + 0] = v[0];
    vertBuf[i * 3 + 1] = v[1];
    vertBuf[i * 3 + 2] = v[2];
  });
  const vao = new Vao(gl, shader, [
    new VaoAttrInit(attrName, vertBuf, 0, 0),
  ]);

  // indices
  const idxData = new Uint16Array(indices.length * 3);
  indices.forEach((idx: TriangleIndices, i: number) => {
    idxData[i * 3 + 0] = idx.a;
    idxData[i * 3 + 1] = idx.b;
    idxData[i * 3 + 2] = idx.c;
  });
  const idxBuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idxData, gl.STATIC_DRAW);

  // so it happens this matches viewport.scene.Mesh
  return {
    vao,
    indexGlType: gl.UNSIGNED_SHORT,
    indexBuffer: idxBuf,
    triangleCnt: indices.length,
  };
};


///////////
// Utils
// <editor-fold> Utils

const generateCircle = (radius: number, segments: number) => {
  const verts = [] as Vertex[];

  for (let i = 0; i < segments; i++) {
    const u = i / segments;
    const theta = u * (Math.PI * 2);
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    verts.push(vert(radius * sinTheta, 0, radius * cosTheta));
  }

  return verts;
};

const generateCircleFaces = (segments: number, offsetA: number, offsetB: number) => {
  const idxs = [] as TriangleIndices[];
  const wrap = (o: number) => o % segments;

  for (let i = 0; i < segments; i++ ) {
    idxs.push({
      a: offsetA + i,
      b: offsetA + wrap(i + 1),
      c: offsetB + i,
    });
    idxs.push({
      a: offsetB + wrap(i + 1),
      b: offsetB + i,
      c: offsetA + wrap(i + 1),
    });
  }

  return idxs;
};

export const addHeight = (height: number) => (v: Vertex) => vert(v[0], v[1] + height, v[2]);

// </editor-fold> // END: Utils


///////////
// Plane
// <editor-fold> plane

interface PlaneShapeDesc {
  width: number;
  height: number;
}

export const generatePlane = (desc: PlaneShapeDesc) => {
  const {width, height} = desc;
  const w = width / 2;
  const h = height / 2;

  return {
    vertices: [
      vert(-w, 0, -h),
      vert(-w, 0,  h),
      vert( w, 0, -h),
      vert( w, 0,  h),
    ],
    indices: [
      {a: 0, b: 1, c: 2},
      {a: 2, b: 1, c: 3},
    ],
  } as Shape;
};

// </editor-fold> // END: plane


///////////
// Donut / Torus
// <editor-fold> Donut

interface DonutShapeDesc {
  radius: number;
  crosscutRadius: number;
  segments: number;
  crosscutSegments: number;
}

export const generateDonut = (desc: DonutShapeDesc) => {
  const {radius, crosscutRadius, segments, crosscutSegments} = desc;

  const crosscutRef = generateCircle(crosscutRadius, crosscutSegments);

  const circles = [] as Vertex[][];
  for (let i = 0; i < crosscutSegments; i++) {
    const ref = crosscutRef[i];
    const circle = generateCircle(radius + ref[0], segments).map(addHeight(ref[2]));
    circles.push(circle);
  }

  const indices = [] as TriangleIndices[][];
  for (let i = 0; i < crosscutSegments; i++) {
    const base = i * segments;
    const next = ((i + 1) % crosscutSegments) * segments;
    indices.push(generateCircleFaces(segments, base, next));
  }

  return {
    vertices: flatten(circles),
    indices: flatten(indices),
  } as Shape;
};

// </editor-fold> // END: Donut


///////////
// Torus
// <editor-fold> torus

interface TorusShapeDesc {
  radius: number;
  height: number;
  segments: number;
}

export const generateTorus = (desc: TorusShapeDesc) => {
  const {radius, height, segments} = desc;

  const vTop = generateCircle(radius, segments);
  const vBot = generateCircle(radius, segments).map(addHeight(height));

  return {
    vertices: [...vTop, ...vBot],
    indices: generateCircleFaces(segments, 0, segments),
  } as Shape;
};

// </editor-fold> // END: torus


///////////
// Cone
// <editor-fold> cone

interface ConeShapeDesc {
  radius: number;
  height: number;
  segments: number;
}

export const generateCone = (desc: ConeShapeDesc) => {
  const {radius, height, segments} = desc;

  const indices = [] as TriangleIndices[];
  for (let i = 0; i < segments; i++) {
    indices.push({
      a: i,
      b: (i + 1) % segments,
      c: segments, // tip
    });
  }

  return {
    vertices: [
      ...generateCircle(radius, segments),
      vert(0, height, 0),
    ],
    indices,
  } as Shape;
};

// </editor-fold> // END: cone
