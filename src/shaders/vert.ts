const vert = `
attribute vec2 a_position;
uniform mat4 u_view;

void main() {
  gl_Position = u_view * vec4(a_position, 0.0, 1.0);
}
`;
export default vert;
