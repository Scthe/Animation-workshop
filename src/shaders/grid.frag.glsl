#extension GL_OES_standard_derivatives : enable
precision mediump float;

// based on:
// http://madebyevan.com/shaders/grid/

uniform float g_gridDensity;
uniform vec3 g_color;
varying vec3 vPos;

void main () {
  // Pick a coordinate to visualize in a grid
  // divided by 2 cuz coords (-1, 1) etc/
  vec2 coord = vPos.xz * (g_gridDensity / 2.0);

  // Compute anti-aliased world-space grid lines
  // shift the grid by (-0.5, -0.5)
  vec2 a = fract(coord - 0.5) - 0.5;
  vec2 grid = abs(a) / fwidth(coord);
  float line = min(grid.x, grid.y);

  // Just visualize the grid lines directly
  float c = 1.0 - min(line, 1.0);
  gl_FragColor = vec4(g_color * vec3(c), c);
}
