precision mediump float;

uniform float g_MarkerRadius;

varying vec3 vColor;
varying vec2 vMarkerCenterPx;

void main () {
  vec2 markerCenterDelta = gl_FragCoord.xy - vMarkerCenterPx;
  float toCenterDist = dot(markerCenterDelta, markerCenterDelta);

  if (toCenterDist > g_MarkerRadius * g_MarkerRadius) {
    discard;
    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }

  gl_FragColor = vec4(vColor, 1.0);
}
