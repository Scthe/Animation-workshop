#extension GL_OES_standard_derivatives : enable
precision mediump float;

uniform vec3 g_baseColor;
varying vec3 vPosition;

float dotMax0 (vec3 a, vec3 b) {
  return max(dot(a, b), 0.0);
}

const vec3 COLOR_WHITE = vec3(1.0, 1.0, 1.0);

////////
// Gamma

const float GAMMA = 2.2;

vec3 gammaFix (vec3 color, float gamma) {
  return pow(color, vec3(1.0 / gamma));
}

////////
// Light

const int LIGHT_COUNT = 2;

struct Light {
  vec3 position;
  vec3 color;
  float intensity;
} LIGHTS[LIGHT_COUNT];

const vec3 AMBIENT_LIGHT = vec3(0.1, 0.1, 0.1);
Light LIGHT_0 = Light(vec3(-10, 10, 10), COLOR_WHITE, 1.0);
Light LIGHT_1 = Light(vec3( 10, -3, -10), COLOR_WHITE, 1.0);

void initLightsArray () {
  LIGHTS[0] = LIGHT_0;
  LIGHTS[1] = LIGHT_1;
}

////////
// Material & brdf

struct Material {
  vec3 albedo;
  vec3 normal;
  vec3 worldPosition;
};

vec3 brdf (Material material, Light light) {
  vec3 L = normalize(light.position - material.worldPosition);
  float LdotN = dotMax0(L, material.normal);
  return material.albedo * LdotN * light.color * light.intensity;
}

vec3 doShading(Material material) {
  vec3 result = material.albedo * AMBIENT_LIGHT;

  for (int i = 0; i < LIGHT_COUNT; i++) {
    result = result + brdf(material, LIGHTS[i]);
  }

  return result;
}

////////
// shader

vec3 getNormal() {
  vec3 fdx = vec3(dFdx(vPosition.x), dFdx(vPosition.y), dFdx(vPosition.z));
  vec3 fdy = vec3(dFdy(vPosition.x), dFdy(vPosition.y), dFdy(vPosition.z));
  return normalize(cross(fdx, fdy));
}

Material createMaterial() {
  Material material;
  material.albedo = g_baseColor;
  material.normal = getNormal();
  material.worldPosition = vPosition;
  return material;
}

void main () {
  initLightsArray();

  Material material = createMaterial();
  vec3 color = doShading(material);
  gl_FragColor = vec4(gammaFix(color, GAMMA), 1.0);
}
