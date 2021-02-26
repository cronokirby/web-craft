import { Mat4, Vec3 } from './math';
import Resources from './Resources';
import { Scene } from './scene';
import frag from './shaders/frag';
import vert from './shaders/vert';

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
  a_shading: number;
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
      a_shading: gl.getAttribLocation(program, 'a_shading'),
    };
    const uniforms = {
      u_view: gl.getUniformLocation(program, 'u_view'),
    };
    const buffers = {
      vertex: gl.createBuffer(),
    };
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      resources.texture,
    );
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return new Renderer(gl, program, attributes, uniforms, buffers);
  }

  private calculateAR(): number {
    resizeCanvasIfNecessary(this.gl.canvas as HTMLCanvasElement);
    return this.gl.canvas.width / this.gl.canvas.height;
  }

  draw(scene: Scene) {
    const ar = this.calculateAR();

    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.BACK);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clearColor(0x71 / 255, 0xad / 255, 0xf6 / 255, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.useProgram(this.program);

    let mat = Mat4.identity();
    mat = Mat4.translation(
      scene.chunk.position.x,
      scene.chunk.position.y,
      scene.chunk.position.z,
    ).mul(mat);
    mat = scene.camera.viewProjection(ar).mul(mat);
    this.gl.uniformMatrix4fv(this.uniforms.u_view, false, mat.columns());

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.vertex);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, scene.chunk.vertex_info, this.gl.STATIC_DRAW);

    this.gl.enableVertexAttribArray(this.attributes.a_position);
    this.gl.vertexAttribPointer(
      this.attributes.a_position,
      3,
      this.gl.FLOAT,
      false,
      4 * 6,
      0,
    );
    this.gl.enableVertexAttribArray(this.attributes.a_tex_coord);
    this.gl.vertexAttribPointer(
      this.attributes.a_tex_coord,
      2,
      this.gl.FLOAT,
      false,
      4 * 6,
      4 * 3,
    );
    this.gl.enableVertexAttribArray(this.attributes.a_shading);
    this.gl.vertexAttribPointer(
      this.attributes.a_shading,
      1,
      this.gl.FLOAT,
      false,
      4 * 6,
      4 * 5,
    );

    this.gl.drawArrays(this.gl.TRIANGLES, 0, scene.chunk.vertex_count);
  }
}
