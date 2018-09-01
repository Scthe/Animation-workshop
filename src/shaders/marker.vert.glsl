precision mediump float;

#pragma glslify: getFullscreenPos = require('./_fullscreenQuad.vert.glsl')

#define MAX_MARKERS (10)
const int VERTICES_PER_MARKER = 6;

attribute float a_VertexId_f;
#define a_VertexId (int(a_VertexId_f))

uniform vec2 g_Viewport;
uniform vec3 g_MarkerColors[MAX_MARKERS];
uniform float g_MarkerRadius[MAX_MARKERS];
// marker center in NDC coordinate system
uniform vec2 g_MarkerPositions[MAX_MARKERS];

varying vec3 vColor;
varying vec2 vMarkerCenterPx;
varying float vMarkerRadius;

int getFullscreenVertexId () {
  return int(mod(a_VertexId_f, 6.0) + 0.5);
}

vec2 NDCtoPixels(vec2 ndc, vec2 viewport) {
  vec2 tmp = (ndc + 1.0) / 2.0;
  return vec2(tmp.x * viewport.x, tmp.y * viewport.y);
}

void main() {
  int markerId = a_VertexId / VERTICES_PER_MARKER;
  vec2 markerPosition = g_MarkerPositions[markerId];
  float markerRadius = g_MarkerRadius[markerId];

  vec2 delta = markerRadius / g_Viewport * 2.0; // size in NDC space
  vec2 deltaSign = getFullscreenPos(getFullscreenVertexId());
  vec2 pos = markerPosition + delta * deltaSign;
  gl_Position = vec4(pos, 0.0, 1.0);

  vColor = g_MarkerColors[markerId];
  vMarkerCenterPx = NDCtoPixels(markerPosition, g_Viewport);
  vMarkerRadius = markerRadius;
}
