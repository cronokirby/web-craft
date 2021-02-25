import frag from './shaders/frag';
import vert from './shaders/vert';
import { Mat4, Color, AngleDeg } from './math';
import { Camera } from './Camera';

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
  position: WebGLBuffer;
  color: WebGLBuffer;
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
      a_tex_coord: gl.getAttribLocation(program, 'a_tex_coord'),
    };
    const uniforms = {
      u_view: gl.getUniformLocation(program, 'u_view'),
    };
    const buffers = {
      position: gl.createBuffer(),
      color: gl.createBuffer(),
    };
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
    //mat = Mat4.rotZ(angle / 2).mul(mat);
    //mat = Mat4.rotY(angle).mul(mat);
    mat = camera.viewProjection().mul(mat);
    this.gl.uniformMatrix4fv(this.uniforms.u_view, false, mat.columns());

    this.gl.enableVertexAttribArray(this.attributes.a_position);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
    this.gl.vertexAttribPointer(
      this.attributes.a_position,
      3,
      this.gl.FLOAT,
      false,
      0,
      0,
    );
    const vertBuf = new Float32Array(6 * 6 * 3);
    {
      let i = 0;
      const face = (a, b, c, d) => {
        vertBuf[i++] = a[0];
        vertBuf[i++] = a[1];
        vertBuf[i++] = a[2];
        vertBuf[i++] = c[0];
        vertBuf[i++] = c[1];
        vertBuf[i++] = c[2];
        vertBuf[i++] = b[0];
        vertBuf[i++] = b[1];
        vertBuf[i++] = b[2];
        vertBuf[i++] = d[0];
        vertBuf[i++] = d[1];
        vertBuf[i++] = d[2];
        vertBuf[i++] = b[0];
        vertBuf[i++] = b[1];
        vertBuf[i++] = b[2];
        vertBuf[i++] = c[0];
        vertBuf[i++] = c[1];
        vertBuf[i++] = c[2];
      }
      // Normal order
      face([0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0]);
      face([1, 0, 0], [1, 0, 1], [1, 1, 0], [1, 1, 1]);
      face([0, 1, 0], [1, 1, 0], [0, 1, 1], [1, 1, 1]);
      // swapped order for culling
      face([0, 0, 1], [0, 1, 1], [1, 0, 1], [1, 1, 1]);
      face([0, 0, 0], [0, 1, 0], [0, 0, 1], [0, 1, 1]);
      face([0, 0, 0], [0, 0, 1], [1, 0, 0], [1, 0, 1]);
    }
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      vertBuf,
      this.gl.STATIC_DRAW,
    );

    this.gl.enableVertexAttribArray(this.attributes.a_tex_coord);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.color);
    this.gl.vertexAttribPointer(
      this.attributes.a_tex_coord,
      2,
      this.gl.UNSIGNED_BYTE,
      true,
      0,
      0,
    );
    const c1 = [58, 228, 246];
    const c2 = [200, 58, 246];
    const c3 = [211, 246, 58];
    const c4 = [67, 246, 58];
    const c5 = [246, 58, 83];
    const c6 = [58, 74, 246];
    const colorBuf = new Uint8Array(6 * 6 * 2);

    {
      let i = 0;
      for (const color of [c1, c2, c3, c4, c5, c6]) {
        for (let j = 0; j < 6; ++j) {
          colorBuf[i++] = color[0];
          colorBuf[i++] = color[1];
        }
      }
    }

    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      colorBuf,
      this.gl.STATIC_DRAW,
    );

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6 * 6);
  }
}
