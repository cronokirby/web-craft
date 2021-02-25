import frag from './shaders/frag';
import Resources from './Resources';
import vert from './shaders/vert';
import { Mat4, Color, AngleDeg, Vec3 } from './math';
import { Camera } from './Camera';

function geometry(): Float32Array {
  const buf = new Float32Array(6 * 6 * 5);
  let i = 0;
  const addVertex = (v: Vec3) => {
    buf[i++] = v.x;
    buf[i++] = v.y;
    buf[i++] = v.z;
  };
  const addColor = (c: number[]) => {
    buf[i++] = c[0];
    buf[i++] = c[1];
  };
  const face = (base: Vec3, eY: Vec3, eX: Vec3) => {
    const a = base;
    const b = base.add(eY);
    const c = base.add(eX);
    const d = b.add(eX);
    addVertex(a);
    addColor([0, 1.0 / 16]);
    addVertex(c);
    addColor([1.0 / 16, 1.0 / 16]);
    addVertex(b);
    addColor([0.0, 0.0]);
    addVertex(d);
    addColor([1.0 / 16, 0.0]);
    addVertex(b);
    addColor([0.0, 0.0]);
    addVertex(c);
    addColor([1.0 / 16, 1.0 / 16]);
  };
  // Front faces
  // Front
  face(new Vec3(0, 0, 1), new Vec3(0, 1, 0), new Vec3(1, 0, 0));
  // Left
  face(new Vec3(0, 0, 0), new Vec3(0, 1, 0), new Vec3(0, 0, 1));
  // Top
  face(new Vec3(0, 1, 1), new Vec3(0, 0, -1), new Vec3(1, 0, 0));
  // Back
  face(new Vec3(1, 0, 0), new Vec3(0, 1, 0), new Vec3(-1, 0, 0));
  // Bottom
  face(new Vec3(0, 0, 0), new Vec3(0, 0, 1), new Vec3(1, 0, 0));
  // Right
  face(new Vec3(1, 0, 1), new Vec3(0, 1, 0), new Vec3(0, 0, -1));

  return buf;
}

function resizeCanvasIfNecessary(canvas: HTMLCanvasElement) {
  if (
    canvas.width != canvas.clientWidth ||
    canvas.height != canvas.clientHeight
  ) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }
}

/**
 * Create a new shader.
 *
 * @param gl the WebGL context
 * @param type an enumeration representing the kind of shader
 * @param source the source code for that shader
 */
function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    const info = gl.getShaderInfoLog(shader);
    const message = `Error creating shader: ${info}`;
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

/**
 * Create a new program for rendering.
 *
 * @param gl the WebGL Context
 * @param shaders the shaders to use in the program
 */
function createProgram(
  gl: WebGLRenderingContext,
  ...shaders: WebGLShader[]
): WebGLProgram {
  const program = gl.createProgram();
  for (const shader of shaders) {
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    const info = gl.getProgramInfoLog(program);
    const message = `Error creating program: ${info}`;
    gl.deleteProgram(program);
    throw new Error(message);
  }
  return program;
}

interface Attributes {
  a_position: number;
  a_tex_coord: number;
}

interface Uniforms {
  u_view: WebGLUniformLocation;
}

interface Buffers {
  vertex: WebGLBuffer;
}

export default class Renderer {
  private constructor(
    private gl: WebGLRenderingContext,
    private program: WebGLProgram,
    private attributes: Attributes,
    private uniforms: Uniforms,
    private buffers: Buffers,
  ) {}

  static init(gl: WebGLRenderingContext, resources: Resources): Renderer {
    const vertShader = createShader(gl, gl.VERTEX_SHADER, vert);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, frag);
    const program = createProgram(gl, vertShader, fragShader);
    const attributes = {
      a_position: gl.getAttribLocation(program, 'a_position'),
      a_tex_coord: gl.getAttribLocation(program, 'a_tex_coord'),
    };
    const uniforms = {
      u_view: gl.getUniformLocation(program, 'u_view'),
    };
    const buffers = {
      vertex: gl.createBuffer(),
    };
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.texture);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return new Renderer(gl, program, attributes, uniforms, buffers);
  }

  calculateAR(): number {
    resizeCanvasIfNecessary(this.gl.canvas as HTMLCanvasElement);
    return this.gl.canvas.width / this.gl.canvas.height;
  }

  draw(camera: Camera, color: Color, angle: AngleDeg) {
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.BACK);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.useProgram(this.program);

    let mat = Mat4.identity();
    mat = Mat4.translation(-0.5, -0.5, -0.5).mul(mat);
    //mat = Mat4.rotY(angle).mul(mat);
    mat = camera.viewProjection().mul(mat);
    this.gl.uniformMatrix4fv(this.uniforms.u_view, false, mat.columns());

    const buf = geometry();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.vertex);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, buf, this.gl.STATIC_DRAW);

    this.gl.enableVertexAttribArray(this.attributes.a_position);
    this.gl.vertexAttribPointer(
      this.attributes.a_position,
      3,
      this.gl.FLOAT,
      false,
      4 * 5,
      0,
    );

    this.gl.enableVertexAttribArray(this.attributes.a_tex_coord);
    this.gl.vertexAttribPointer(
      this.attributes.a_tex_coord,
      2,
      this.gl.FLOAT,
      false,
      4 * 5,
      4 * 3,
    );

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6 * 6);
  }
}
