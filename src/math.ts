// Should be good enough
const EPSILON = 1e-6;

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
  private data: Float32Array;

  /**
   * Create a new color, from each component.
   *
   * @param r the red component
   * @param g the green component
   * @param b the blue component
   * @param a the alpha component, defaulting to 1.0
   */
  constructor(r: number, g: number, b: number, a?: number) {
    this.data = new Float32Array([r, g, b, a ?? 1.0]);
  }

  get r(): number {
    return this.data[0];
  }

  set r(x: number) {
    this.data[0] = x;
  }

  get g(): number {
    return this.data[1];
  }

  set g(x: number) {
    this.data[1] = x;
  }

  get b(): number {
    return this.data[2];
  }

  set b(x: number) {
    this.data[2] = x;
  }

  get a(): number {
    return this.data[3];
  }

  set a(x: number) {
    this.data[3] = x;
  }

  *[Symbol.iterator]() {
    for (const x of this.data) {
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

  static perspective(
    ar: number,
    fov: AngleDeg,
    near: number,
    far: number,
  ): Mat4 {
    const top = near * Math.tan(degToRad(fov) / 2);
    const bottom = -top;
    const right = top * ar;
    const left = -right;
    return new Mat4(
      new Float32Array([
        (2 * near) / (right - left),
        0,
        0,
        0,
        0,
        (2 * near) / (top - bottom),
        0,
        0,
        0,
        0,
        (far + near) / (near - far),
        -1,
        (near * (right + left)) / (left - right),
        (near * (top + bottom)) / (bottom - top),
        (2 * far * near) / (near - far),
        0,
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

  /**
   * Invert a rigid matrix.
   *
   * This assumes that the matrix consists of rotations,
   * and translations. No shearing, or projections, or scaling.
   */
  invRigid(): Mat4 {
    const u = new Vec3(this.data[0], this.data[1], this.data[2]);
    const v = new Vec3(this.data[4], this.data[5], this.data[6]);
    const w = new Vec3(this.data[8], this.data[9], this.data[10]);
    const t = new Vec3(this.data[12], this.data[13], this.data[14]);

    return new Mat4(
      new Float32Array([
        u.x,
        v.x,
        w.x,
        0,
        u.y,
        v.y,
        w.y,
        0,
        u.z,
        v.z,
        w.z,
        0,
        -u.dot(t),
        -v.dot(t),
        -w.dot(t),
        1.0,
      ]),
    );
  }

  act(on: Vec3): Vec3 {
    return new Vec3(
      this.data[0] * on.x + this.data[4] * on.y + this.data[8] * on.z,
      this.data[1] * on.x + this.data[5] * on.y + this.data[9] * on.z,
      this.data[2] * on.x + this.data[6] * on.y + this.data[10] * on.z,
    );
  }

  basis(): [Vec3, Vec3, Vec3] {
    return [
      new Vec3(this.data[0], this.data[1], this.data[2]),
      new Vec3(this.data[4], this.data[5], this.data[6]),
      new Vec3(this.data[8], this.data[9], this.data[10]),
    ];
  }

  /**
   * Check that two matrices are approximately equal
   */
  approxEqual(that: Mat4): boolean {
    for (let i = 0; i < 16; ++i) {
      if (Math.abs(this.data[i] - that.data[i]) > EPSILON) {
        return false;
      }
    }
    return true;
  }

  columns(): Iterable<number> {
    return this.data;
  }
}

/**
 * Represents a position in 3d space, or more braodly a vector.
 */
export class Vec3 {
  private data: Float32Array;

  /**
   * Create a new vector, using each of its components.
   */
  constructor(x: number, y: number, z: number) {
    this.data = new Float32Array([x, y, z]);
  }

  get x(): number {
    return this.data[0];
  }

  set x(v: number) {
    this.data[0] = v;
  }

  get y(): number {
    return this.data[1];
  }

  set y(v: number) {
    this.data[1] = v;
  }

  get z(): number {
    return this.data[2];
  }

  set z(v: number) {
    this.data[2] = v;
  }

  get w(): number {
    return 1.0;
  }

  /**
   * Take the dot product with another vector.
   *
   * @param that the other vector to take the dot product with
   */
  dot(that: Vec3): number {
    return (
      Math.fround(this.data[0] * that.data[0]) +
      Math.fround(this.data[1] * that.data[1]) +
      Math.fround(this.data[2] * that.data[2])
    );
  }

  scale(factor: number): Vec3 {
    return new Vec3(
      this.data[0] * factor,
      this.data[1] * factor,
      this.data[2] * factor,
    );
  }

  add(that: Vec3): Vec3 {
    return new Vec3(
      this.data[0] + that.data[0],
      this.data[1] + that.data[1],
      this.data[2] + that.data[2],
    );
  }

  mul(that: Vec3): Vec3 {
    return new Vec3(
      this.data[0] * that.data[0],
      this.data[1] * that.data[1],
      this.data[2] * that.data[2],
    );
  }

  norm(): Vec3 {
    const magnitude = this.dot(this);
    if (Math.abs(magnitude) < EPSILON) {
      return this;
    }
    return this.scale(1 / magnitude);
  }

  /**
   * Return an iterable over the components of this vector.
   *
   * @returns an iterable yielding each of the three components
   */
  components(): Iterable<number> {
    return this.data;
  }
}

export function clamp(x: number, min: number, max: number) {
  if (x < min) {
    return min;
  }
  if (x > max) {
    return max;
  }
  return x;
}
