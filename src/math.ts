/**
 * Represents a certain amount of seconds.
 *
 * This is just a synonym for number, but can be useful to talk about the kind
 * of unit you use a bit more precisely.
 */
export type Seconds = number;

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

/**
 * Represents a 4x4 matrix.
 *
 * Most operations work in a "scratch" model, where the receiver takes in all arguments,
 * and uses its memory to store the result. Aliasing is fine.
 */
export class Mat4 {
  // data is stored in column major format
  private constructor(private data: Float32Array) {}

  static identity(): Mat4 {
    return Mat4.scaled(1, 1, 1);
  }

  static scaled(x: number, y: number, z: number): Mat4 {
    return new Mat4(
      new Float32Array([x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]),
    );
  }

  static translated(x: number, y: number, z: number): Mat4 {
    return new Mat4(
      new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]),
    );
  }

  mul(a: Mat4, b: Mat4): Mat4 {
    let i = 0;
    for (let bi = 0; bi < 16; bi += 4) {
      for (let ai = 0; ai < 4; ++ai) {
        this.data[i++] =
          a.data[ai] * b.data[bi] +
          a.data[ai + 4] * b.data[bi + 1] +
          a.data[ai + 8] * b.data[bi + 2] +
          a.data[ai + 12] * b.data[bi + 3];
      }
    }
    return this;
  }

  columns(): Iterable<number> {
    return this.data;
  }
}
