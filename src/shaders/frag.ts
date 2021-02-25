const frag = `
precision mediump float;

uniform sampler2D u_texture;

varying vec2 v_tex_coord;
varying float v_shading;

void main() {
  gl_FragColor = texture2D(u_texture, v_tex_coord) * vec4(v_shading, v_shading, v_shading, 1.0);
}
`;
export default frag;
