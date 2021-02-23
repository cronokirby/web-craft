import frag from './shaders/frag';
import vert from './shaders/vert';
import { Color } from './math';

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
}

interface Uniforms {
  u_color: WebGLUniformLocation;
  u_view: WebGLUniformLocation;
}

interface Buffers {
  position: WebGLBuffer;
}

export default class Renderer {
  private constructor(
    private gl: WebGLRenderingContext,
    private program: WebGLProgram,
    private attributes: Attributes,
    private uniforms: Uniforms,
    private buffers: Buffers,
  ) {}

  static init(gl: WebGLRenderingContext): Renderer {
    const vertShader = createShader(gl, gl.VERTEX_SHADER, vert);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, frag);
    const program = createProgram(gl, vertShader, fragShader);
    const attributes = {
      a_position: gl.getAttribLocation(program, 'a_position'),
    };
    const uniforms = {
      u_color: gl.getUniformLocation(program, 'u_color'),
      u_view: gl.getUniformLocation(program, 'u_view'),
    };
    const buffers = {
      position: gl.createBuffer(),
    };
    return new Renderer(gl, program, attributes, uniforms, buffers);
  }

  draw(color: Color) {
    resizeCanvasIfNecessary(this.gl.canvas as HTMLCanvasElement);

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.useProgram(this.program);

    this.gl.uniform4fv(this.uniforms.u_color, color);
    this.gl.uniformMatrix4fv(this.uniforms.u_view, false, [
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
    ]);

    this.gl.enableVertexAttribArray(this.attributes.a_position);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);

    this.gl.vertexAttribPointer(
      this.attributes.a_position,
      2,
      this.gl.FLOAT,
      false,
      0,
      0,
    );

    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([-0.5, 0, 0, 0.5, 0.5, 0]),
      this.gl.STATIC_DRAW,
    );
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
  }
}
