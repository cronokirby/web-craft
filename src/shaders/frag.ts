const frag = `
precision mediump float;

uniform sampler2D u_texture;

varying vec2 v_tex_coord;

void main() {
  gl_FragColor = texture2D(u_texture, v_tex_coord);
  //gl_FragColor = vec4(v_tex_coord, 1.0, 1.0);
}
`;
export default frag;
