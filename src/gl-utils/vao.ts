import {Shader} from './Shader';

interface VaoAttrInfo {
  name: string;
  location: GLint;
  baseType: GLenum; // e.g. gl.FLOAT
  elCount: number;
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

  // create buffer
  const glBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, attr.rawData, gl.STATIC_DRAW); // write

  // connect buffer->attribute
  const location = shaderAttr.location;
  const [baseType, elCount] = deconstructAttrType(gl, shaderAttr.type);
  gl.vertexAttribPointer(location, elCount, baseType, false, stride, offset);
  gl.enableVertexAttribArray(location);

  return {
    name: name,
    location,
    baseType,
    elCount,
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

  bind (_: Webgl) {}

  destroy (_: Webgl) {
    this.isOk = false;
  }

}
