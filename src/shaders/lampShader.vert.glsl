precision mediump float;

#define MAX_WEIGHTS (4) // affecting weights per vertex
#define MAX_BONE_COUNT (10) // max number of bones in skeleton


attribute vec3 a_Position;
attribute vec4 a_BoneIDs;
attribute vec4 a_Weights; // always (1,0,0,0), cause only 1 bone influences ATM

uniform mat4 g_MV;
uniform mat4 g_MVP;
uniform mat4 g_BoneTransforms[MAX_BONE_COUNT];

varying vec3 vPosition;

void main() {
   vec4 localPos = vec4(0.0);
   // vec4 localNormal = vec4(0.0);

   for (int i = 0; i < MAX_WEIGHTS; i++) {
     int boneId = int(a_BoneIDs[i]);
     vec4 skinPos = g_BoneTransforms[boneId] * vec4(a_Position, 1.0);
     // vec4 worldNormal = g_BoneTransforms[boneId] * vec4(a_Normal, 1.0);

     localPos += skinPos * a_Weights[i];
     // localNormal += worldNormal * a_Weights[i];
   }

   vPosition = (g_MV * localPos).xyz;
   gl_Position = g_MVP * localPos;
}
