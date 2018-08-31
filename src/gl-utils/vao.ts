import {Shader} from './Shader';

interface VaoAttrInfo {
  name: string;
  glBuffer: WebGLBuffer;
  location: GLint;
  baseType: GLenum; // e.g. gl.FLOAT
  elCount: number; // e.g. 3 for vec3, 1 for float etc.
  stride: number;
  offset: number;
}

export class VaoAttrInit {
  constructor (
    public name: string,
    public rawData: any,
    public stride: number,
    public offset: number) {
  }
}

const deconstructAttrType = (gl: Webgl, type: GLenum) => {
  switch (type) {
    case gl.FLOAT: return [gl.FLOAT, 1];
    case gl.FLOAT_VEC2: return [gl.FLOAT, 2];
    case gl.FLOAT_VEC3: return [gl.FLOAT, 3];
    case gl.FLOAT_VEC4: return [gl.FLOAT, 4];
    default: throw `Unsupported vertex attribute type: ${type}`;
  }
};

const setAttrFromBuffer = (gl: Webgl, shader: Shader, attr: VaoAttrInit) => {
  const {name, rawData, offset, stride} = attr;

  let shaderAttr = shader.getAttr(name);
  if (!shaderAttr) { return null; }

  // create glBuffer and write
  const glBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, rawData, gl.STATIC_DRAW);

  // connect buffer->attribute
  const [baseType, elCount] = deconstructAttrType(gl, shaderAttr.type);

  return {
    name,
    glBuffer,
    location: shaderAttr.location,
    baseType,
    elCount,
    stride,
    offset
  } as VaoAttrInfo;
};

export class Vao {
  attrs: VaoAttrInfo[] = [];
  private isOk = false;

  constructor(gl: Webgl, shader: Shader, attrs: VaoAttrInit[]) {
    attrs.forEach(attr => {
      let assignedAttr = setAttrFromBuffer(gl, shader, attr);
      if (assignedAttr) {
        this.attrs.push(assignedAttr);
      } else {
        console.error(`Vertex attribute ${attr.name} not found. ` +
          'This attribute may simply be not used, so it is not critical. ' +
          'Vao may not work as expected');
      }
    });

    this.isOk = attrs.length === this.attrs.length; // all were assigned sucesfully
  }

  isCreated () { return this.isOk; }

  bind (gl: Webgl) {
    const bindAttr = ((attr: VaoAttrInfo) => {
      const {glBuffer, location, baseType, elCount, stride, offset} = attr;
      gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
      gl.vertexAttribPointer(location, elCount, baseType, false, stride, offset);
      gl.enableVertexAttribArray(location);
    });

    this.attrs.forEach(bindAttr);
  }

  destroy (gl: Webgl) {
    this.isOk = false;
    this.attrs.forEach(a => gl.deleteBuffer(a.glBuffer));
  }

}
