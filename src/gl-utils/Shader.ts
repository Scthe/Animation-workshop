import STATIC_GL from './gimme_gl';

enum ShaderStage {
  VertexShader = STATIC_GL.VERTEX_SHADER,
  FragmentShader = STATIC_GL.FRAGMENT_SHADER,
}

const compileShaderStage = (gl: Webgl, stage: ShaderStage, source: string) => {
  const glId = gl.createShader(stage);
  gl.shaderSource(glId, source);
  gl.compileShader(glId);
  const isOk = gl.getShaderParameter(glId, gl.COMPILE_STATUS);

  if (!isOk) {
    console.error('Vertex shader compile error:', gl.getShaderInfoLog(glId));
    gl.deleteShader(glId);
    return undefined;
  } else {
    return glId;
  }
};

interface ActiveInfo {
  name: string;
  size: number;
  type: GLenum;
  location: GLint;
}
type ActiveResourceMap = {[name: string]: ActiveInfo};

const introspectAttrs = (gl: Webgl, shader: Shader) => {
  const attribCount = gl.getProgramParameter(shader.glId, gl.ACTIVE_ATTRIBUTES);
  const attrs: ActiveResourceMap = {};

  for (let i = 0; i < attribCount; i++) {
    const attribInfo = gl.getActiveAttrib(shader.glId, i);
    attrs[attribInfo.name] = {
      size: attribInfo.size, // cannot use spread :(
      name: attribInfo.name,
      type: attribInfo.type,
      location: gl.getAttribLocation(shader.glId, attribInfo.name),
    };
  }

  return attrs;
};

const introspectUniforms = (gl: Webgl, shader: Shader) => {
  const uniformCount = gl.getProgramParameter(shader.glId, gl.ACTIVE_UNIFORMS);
  const uniforms: ActiveResourceMap = {};

  for (let i = 0; i < uniformCount; i++) {
    const uniformInfo = gl.getActiveUniform(shader.glId, i);
    const uniformQueryName = uniformInfo.name.replace('[0]', '');
    uniforms[uniformInfo.name] = {
      size: uniformInfo.size, // cannot use spread :(
      name: uniformInfo.name,
      type: uniformInfo.type,
      location: gl.getUniformLocation(shader.glId, uniformQueryName) as any, // technically WebGLUniformLocation ./shrug
    };
  }

  return uniforms;
};

const INVALID_SHADER_ID: WebGLProgram = null;

export class Shader {
  glId: WebGLProgram = INVALID_SHADER_ID;
  private attrs: ActiveResourceMap = {};
  private uniforms: ActiveResourceMap = {};

  constructor(gl: Webgl, vertText: string, fragText: string) {
    this.glId = gl.createProgram();

    const vertGlID = compileShaderStage(gl, ShaderStage.VertexShader, vertText);
    const fragGlID = compileShaderStage(gl, ShaderStage.FragmentShader, fragText);
    if (!vertGlID || !fragGlID) {
      this.destroy(gl);
      return;
    }

    gl.attachShader(this.glId, vertGlID);
    gl.attachShader(this.glId, fragGlID);
    gl.linkProgram(this.glId);
    gl.deleteShader(vertGlID);
    gl.deleteShader(fragGlID);

    const isOk = gl.getProgramParameter(this.glId, gl.LINK_STATUS);
    if (!isOk) {
      this.destroy(gl);
    } else {
      this.attrs = introspectAttrs(gl, this);
      this.uniforms = introspectUniforms(gl, this);
    }
  }

  isCreated () { return this.glId !== INVALID_SHADER_ID; }

  use (gl: Webgl) { gl.useProgram(this.glId); }

  destroy (gl: Webgl) {
    gl.deleteProgram(this.glId);
    this.glId = INVALID_SHADER_ID;
  }

  getAttr (name: string) { return this.attrs[name]; }
  getUniform (name: string) { return this.uniforms[name]; }
}
