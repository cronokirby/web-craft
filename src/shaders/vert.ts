const vert = `
attribute vec3 a_position;
attribute vec3 a_color;

uniform mat4 u_view;

varying vec4 v_color;

void main() {
  gl_Position = u_view * vec4(a_position, 1.0);

  v_color = vec4(a_color, 1.0);
}
`;
export default vert;
