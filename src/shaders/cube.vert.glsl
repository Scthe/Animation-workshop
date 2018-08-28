precision mediump float;

attribute vec3 position;
attribute vec3 color;

uniform mat4 Pmatrix;
uniform mat4 Vmatrix;
uniform mat4 Mmatrix;
varying vec3 vColor;

void main() {
   gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.0);
   vColor = color; // TODO colors are in [0-7] range? wtf?
}
