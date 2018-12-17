precision mediump float;

attribute vec3 a_Position;

uniform mat4 g_MVP;

varying vec3 vPos;

void main() {
   gl_Position = g_MVP * vec4(a_Position, 1.0);
   vPos = a_Position;
}
