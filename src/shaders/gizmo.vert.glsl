precision mediump float;

attribute vec3 a_Position;

uniform mat4 g_MVP;
uniform vec3 g_Color;

varying vec3 vColor;

void main() {
   vec4 pos = vec4(a_Position * 1.0, 1.0);
   gl_Position = g_MVP * pos; // TODO divide by w

   vColor = g_Color;
}
