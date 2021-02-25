const vert = `
attribute vec3 a_position;
attribute vec2 a_tex_coord;
attribute float a_shading;

uniform mat4 u_view;

varying vec2 v_tex_coord;
varying float v_shading;

void main() {
  gl_Position = u_view * vec4(a_position, 1.0);

  v_tex_coord = a_tex_coord;
  v_shading = a_shading;
}
`;
export default vert;
