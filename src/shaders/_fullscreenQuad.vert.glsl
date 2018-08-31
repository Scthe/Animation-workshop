const vec2 TOP_LEFT  = vec2(-1.0, 1.0);
const vec2 TOP_RIGHT = vec2( 1.0, 1.0);
const vec2 BOT_LEFT  = vec2(-1.0, -1.0);
const vec2 BOT_RIGHT = vec2( 1.0, -1.0);

// @param vertexId has to be [0-6]
vec2 getFullscreenPos (int vertexId) {
  if (vertexId == 0){ return TOP_LEFT; }
  if (vertexId == 1){ return BOT_LEFT; }
  if (vertexId == 2){ return TOP_RIGHT; }
  if (vertexId == 3){ return TOP_RIGHT; }
  if (vertexId == 4){ return BOT_LEFT; }
  if (vertexId == 5){ return BOT_RIGHT; }
  return TOP_LEFT;
}

#pragma glslify: export(getFullscreenPos)
