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
    public buf: any,
    public stride: number,
    public offset: number) {
  }
}

const deconstructAttrType = (gl: Webgl, type: GLenum) => {
  let t: GLenum = null;
  let c = 0;

  // gl.FLOAT
  switch (type) {
    case gl.FLOAT_VEC2: t = gl.FLOAT; c = 2; break;
    case gl.FLOAT_VEC3: t = gl.FLOAT; c = 3; break;
    case gl.FLOAT_VEC4: t = gl.FLOAT; c = 4; break;
    default: throw `Unsupported vertex attribute type: ${type}`;
  }

  return {
    baseType: t,
    elCount: c,
  };
};

const setAttrFromBuffer = (gl: Webgl, shader: Shader, attr: VaoAttrInit) => {
  let shaderAttr = shader.getAttr(attr.name);
  if (!shaderAttr) {
    return null;
  }

  const position = shaderAttr.location;
  const {baseType, elCount} = deconstructAttrType(gl, shaderAttr.type);
  gl.bindBuffer(gl.ARRAY_BUFFER, attr.buf);
  gl.vertexAttribPointer(position, elCount, baseType, false, attr.stride, attr.offset);
  gl.enableVertexAttribArray(position);

  return {
    name: attr.name,
    location: position,
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
        console.error(`Vertex attribute ${attr.name} not found. Could not create Vao`);
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
