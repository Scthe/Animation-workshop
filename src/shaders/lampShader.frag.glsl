precision mediump float;

varying vec3 vColor;

void main () {
  // float c = 0.7;
  // gl_FragColor = vec4(c, c, c, 1.0);
  gl_FragColor = vec4(vColor, 1.0);
}
