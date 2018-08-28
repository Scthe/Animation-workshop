// should be: WebGLContextCreationAttirbutes, but not defined
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
type WebGLContextOpts = object;

const GET_A_WEBGL_BROWSER = '' +
  'This page requires a browser that supports WebGL.<br/>' +
  '<a href="http://get.webgl.org">Click here to upgrade your browser.</a>';

const OTHER_PROBLEM = '' +
  'It doesn\'t appear your computer can support WebGL.<br/>' +
  '<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>';

const makeFailHTML = function(msg: string) {
  return '' +
    '<table style="background-color: #8CE; width: 100%; height: 100%;"><tr>' +
    '<td align="center">' +
    '<div style="display: table-cell; vertical-align: middle;">' +
    '<div style="">' + msg + '</div>' +
    '</div>' +
    '</td></tr></table>';
};

const globalWebGlContext = () => {
  (window as any).WebGLRenderingContext;
};

const handleCreationError = (canvas: HTMLCanvasElement, msg?: string) => {
  const container = canvas.parentNode;
  if (container) {
    let str = globalWebGlContext() ? OTHER_PROBLEM : GET_A_WEBGL_BROWSER;
    if (msg) {
      str += '<br/><br/>Status: ' + msg;
    }
    (container as any).innerHTML = makeFailHTML(str);
  }
};

const create3DContext = (canvas: HTMLCanvasElement, optAttribs: WebGLContextOpts) => {
  const names = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl'];
  let context = null;
  for (let name of names) {
    try {
      context = canvas.getContext(name, optAttribs);
    } catch (e) { }
    if (context) {
      break;
    }
  }

  return context as Webgl;
};

export const createWebGlContext = (canvas: HTMLCanvasElement, optAttribs: WebGLContextOpts) => {
  if (canvas.addEventListener) {
    let cb = (event: any) => { handleCreationError(canvas, event.statusMessage); };
    canvas.addEventListener('webglcontextcreationerror', cb, false);
  }

  const context = create3DContext(canvas, optAttribs);
  if (!context || !(context instanceof WebGLRenderingContext)) {
    if (!globalWebGlContext()) {
      handleCreationError(canvas);
    }
  }
  return context;
};
