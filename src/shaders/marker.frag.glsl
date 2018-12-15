precision mediump float;

varying vec3 vColor;
varying vec2 vCornerIntercardinal;

void main () {
  float toCenterDist = dot(vCornerIntercardinal, vCornerIntercardinal);
  if (toCenterDist > 1.0) {
    discard;
  }

  gl_FragColor = vec4(vColor, 1.0);
}
