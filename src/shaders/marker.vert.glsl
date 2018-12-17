precision mediump float;

#pragma glslify: getFullscreenPos = require('./_fullscreenQuad.vert.glsl')

// billboards tuorial:
// http://www.chinedufn.com/webgl-particle-effect-billboard-tutorial/

#define MAX_MARKERS (32)
const int VERTICES_PER_MARKER = 6;

attribute float a_VertexId_f;
#define a_VertexId (int(a_VertexId_f))

uniform mat4 g_VP;
uniform mat4 g_V;
uniform vec3 g_MarkerColors[MAX_MARKERS];
uniform float g_MarkerRadius[MAX_MARKERS];
uniform vec3 g_MarkerPositions[MAX_MARKERS];

varying vec3 vColor;
varying vec2 vCornerIntercardinal; // coordinates of corners in [-1,1] space

int getFullscreenVertexId () {
  // (vertexId % VERTICES_PER_MARKER), but we have to operate on floats cause webgl.
  // We add 0.5 cause maybe rounding errors will happen or smth.
  return int(mod(a_VertexId_f, float(VERTICES_PER_MARKER)) + 0.5);
}

struct Marker {
  vec3 positionWS;
  float radius;
  vec3 color;
  vec3 billboardRight;
  vec3 billboardUp;
};

Marker createMarker() {
  int markerId = a_VertexId / VERTICES_PER_MARKER;

  Marker marker;
  marker.positionWS = g_MarkerPositions[markerId];
  marker.radius = g_MarkerRadius[markerId];
  marker.color = g_MarkerColors[markerId];
  marker.billboardRight = vec3(g_V[0].x, g_V[1].x, g_V[2].x);
  marker.billboardUp = vec3(g_V[0].y, g_V[1].y, g_V[2].y);
  return marker;
}

void main() {
  Marker marker = createMarker();
  // intercardinal directions, see vCornerIntercardinal
  vec2 deltaSign = getFullscreenPos(getFullscreenVertexId());

  vec3 cornerWS = marker.positionWS;
  cornerWS += marker.billboardRight * marker.radius * deltaSign.x;
  cornerWS += marker.billboardUp * marker.radius * deltaSign.y;

  // NOTE: important: leave as is, do not rewrite into vec4(_.xyz, 1.0)
  gl_Position = g_VP * vec4(cornerWS, 1.0);

  vColor = marker.color;
  vCornerIntercardinal = deltaSign;
}
