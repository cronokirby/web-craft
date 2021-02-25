const frag = `
precision mediump float;

varying vec2 v_tex_coord;

void main() {
  gl_FragColor = vec4(v_tex_coord.x, 0.0, v_tex_coord.y, 1.0);
}
`;
export default frag;
