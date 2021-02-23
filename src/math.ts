/**
 * Represents a certain amount of seconds.
 *
 * This is just a synonym for number, but can be useful to talk about the kind
 * of unit you use a bit more precisely.
 */
export type Seconds = number;

/**
 * Represents a certain angle, in degrees
 */
export type AngleDeg = number;

/**
 * Represents a certain angle, in radians
 */
export type AngleRad = number;

/**
 * Represents an RGBA color.
 */
export class Color implements Iterable<number> {
  private arr: Float32Array;

  /**
   * Create a new color, from each component.
   *
   * @param r the red component
   * @param g the green component
   * @param b the blue component
   * @param a the alpha component, defaulting to 1.0
   */
  constructor(r: number, g: number, b: number, a?: number) {
    this.arr = new Float32Array([r, g, b, a ?? 1.0]);
  }

  get r(): number {
    return this.arr[0];
  }

  set r(x: number) {
    this.arr[0] = x;
  }

  get g(): number {
    return this.arr[1];
  }

  set g(x: number) {
    this.arr[1] = x;
  }

  get b(): number {
    return this.arr[2];
  }

  set b(x: number) {
    this.arr[2] = x;
  }

  get a(): number {
    return this.arr[3];
  }

  set a(x: number) {
    this.arr[3] = x;
  }

  *[Symbol.iterator]() {
    for (const x of this.arr) {
      yield x;
    }
  }
}

function degToRad(angle: AngleDeg): AngleRad {
  return (angle / 180) * Math.PI;
}

/**
 * Represents a 4x4 matrix.
 */
export class Mat4 {
  // data is stored in column major format
  private constructor(private data: Float32Array) {}

  static identity(): Mat4 {
    return Mat4.scale(1, 1, 1);
  }

  static scale(x: number, y: number, z: number): Mat4 {
    return new Mat4(
      new Float32Array([x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]),
    );
  }

  static translation(x: number, y: number, z: number): Mat4 {
    return new Mat4(
      new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]),
    );
  }

  static rotX(angle: AngleDeg) {
    const theta = degToRad(angle);
    return new Mat4(
      new Float32Array([
        1,
        0,
        0,
        0,
        0,
        Math.cos(theta),
        Math.sin(theta),
        0,
        0,
        -Math.sin(theta),
        Math.cos(theta),
        0,
        0,
        0,
        0,
        1,
      ]),
    );
  }

  static rotY(angle: AngleDeg) {
    const theta = degToRad(angle);
    return new Mat4(
      new Float32Array([
        Math.cos(theta),
        0,
        -Math.sin(theta),
        0,
        0,
        1,
        0,
        0,
        Math.sin(theta),
        0,
        Math.cos(theta),
        0,
        0,
        0,
        0,
        1,
      ]),
    );
  }

  static rotZ(angle: AngleDeg) {
    const theta = degToRad(angle);
    return new Mat4(
      new Float32Array([
        Math.cos(theta),
        Math.sin(theta),
        0,
        0,
        -Math.sin(theta),
        Math.cos(theta),
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
      ]),
    );
  }

  mul(that: Mat4): Mat4 {
    const out = Mat4.identity();
    for (let k = 0; k < 4; ++k) {
      for (let i = 0; i < 4; ++i) {
        let acc = 0;
        for (let j = 0; j < 4; ++j) {
          acc += this.data[i + (j << 2)] * that.data[j + (k << 2)];
        }
        out.data[i + (k << 2)] = acc;
      }
    }
    return out;
  }

  columns(): Iterable<number> {
    return this.data;
  }
}
