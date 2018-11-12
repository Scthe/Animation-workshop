precision mediump float;

varying vec3 vColor;
varying vec2 vMarkerCenterPx;
varying float vMarkerRadius;

void main () {
  vec2 markerCenterDelta = gl_FragCoord.xy - vMarkerCenterPx;
  float toCenterDist = dot(markerCenterDelta, markerCenterDelta);

  if (toCenterDist > vMarkerRadius * vMarkerRadius) {
    discard;
  }

  gl_FragColor = vec4(vColor, 1.0);
}
