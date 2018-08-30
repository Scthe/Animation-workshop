precision mediump float;

#define MAX_MARKERS (10)

attribute float a_VertexId_f;
#define a_VertexID (int(a_VertexId_f))

uniform vec2 g_MarkerPositions[MAX_MARKERS];
uniform vec2 g_Viewport;

varying vec3 vColor;

/////////////////
const vec2 TOP_LEFT  = vec2(-1.0, 1.0);
const vec2 TOP_RIGHT = vec2( 1.0, 1.0);
const vec2 BOT_LEFT  = vec2(-1.0, -1.0);
const vec2 BOT_RIGHT = vec2( 1.0, -1.0);

vec2 getFullscreenPos () {
  int vid = int(mod(a_VertexId_f, 6.0) + 0.5);
  if (vid == 0){ return TOP_LEFT; }
  if (vid == 1){ return BOT_LEFT; }
  if (vid == 2){ return TOP_RIGHT; }
  if (vid == 3){ return TOP_RIGHT; }
  if (vid == 4){ return BOT_LEFT; }
  if (vid == 5){ return BOT_RIGHT; }
  return TOP_LEFT;
}
/////////////////

const int VERTICES_PER_MARKER = 6;
const float MARKER_RADIUS = 15.0;

void main() {
   vColor = vec3(0, 1, 0);

   int markerId = a_VertexID / VERTICES_PER_MARKER;
   vec2 markerPosition = g_MarkerPositions[markerId];
   vec2 delta = MARKER_RADIUS / g_Viewport;
   vec2 deltaSign = getFullscreenPos();
   vec2 pos = markerPosition + delta * deltaSign;
   gl_Position = vec4(pos, 0.0, 1.0);
}
