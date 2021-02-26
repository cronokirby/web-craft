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
 *
 * This is commonly used to represent standard 3x3 transformations, along with affine translations,
 * and further projections, using homogenous coordinates, for perspective.
 */
export class Mat4 {
  // data is stored in column major format
  private constructor(private data: Float32Array) {}

  /**
   * Create an identity matrix.
   *
   * This matrix does no transformation on its input, leaving everything intact.
   */
  static identity(): Mat4 {
    return Mat4.scale(1, 1, 1);
  }

  /**
   * Create a scaling matrix, scaling each dimension independently.
   *
   * This will stretch each of the dimensions, according to the factor passed in.
   */
  static scale(x: number, y: number, z: number): Mat4 {
    return new Mat4(
      new Float32Array([x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]),
    );
  }

  /**
   * Represents a translation matrix.
   *
   * The effect of this matrix is to move
   */
  static translation(x: number, y: number, z: number): Mat4 {
    return new Mat4(
      new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]),
    );
  }

  /**
   * A matrix rotating along the X axis.
   *
   * @param angle the angle (degrees) to rotate by
   */
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

  /**
   * A matrix rotating along the Y axis
   *
   * @param angle the angle (degrees) to rotate by
   */
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

  /**
   * A matrix rotating along the Z axis
   *
   * @param angle the angle (degrees) to rotate by
   */
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

  /**
   * Create a perspective matrix.
   *
   * The purpose of a perspective matrix is to be able to convert objects in front
   * of the camera into screen coordinates. It does this mimicking the perspective
   * you see in the real world, with objects further away appearing smaller.
   *
   * @param ar the aspect ratio (width / height) of the screen
   * @param fov the size, in degrees, of the vertical field of view
   * @param near the cutoff plane for objects near the camera
   * @param far the cutoff plane for objects away from the camera
   */
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

  /**
   * Multiply this matrix by another one.
   *
   * This yields a new transformation, which runs that matrix,
   * and then this matrix.
   *
   * @param that the other matrix to multiply with
   */
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

  /**
   * Transform the values of a vector, according to a matrix transformation.
   *
   * @param on the vector to transform
   */
  act(on: Vec3): Vec3 {
    return new Vec3(
      this.data[0] * on.x + this.data[4] * on.y + this.data[8] * on.z,
      this.data[1] * on.x + this.data[5] * on.y + this.data[9] * on.z,
      this.data[2] * on.x + this.data[6] * on.y + this.data[10] * on.z,
    );
  }

  /**
   * Return the action of this matrix on a standard basis.
   *
   * @returns the action on the X, Y, and Z basis vectors
   */
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

  /**
   * Return the elements of this matrix, in column order
   *
   * This is the order that GL shaders expect.
   */
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

  /**
   * Scale a vector by a certain factor.
   *
   * @param factor the factor to scale by
   */
  scale(factor: number): Vec3 {
    return new Vec3(
      this.data[0] * factor,
      this.data[1] * factor,
      this.data[2] * factor,
    );
  }

  /**
   * Add this vector with another vector.
   *
   * This performs pointwise addition, but also has geometric meaning.
   *
   * @param that the vector to add to this one.
   */
  add(that: Vec3): Vec3 {
    return new Vec3(
      this.data[0] + that.data[0],
      this.data[1] + that.data[1],
      this.data[2] + that.data[2],
    );
  }

  /**
   * Perform pointwise multiplication of this vector with another.
   *
   * This has less geometric meaning, but can be a convenient ad-hoc
   * operation.
   *
   * @param that the other vector to multiply with
   */
  mul(that: Vec3): Vec3 {
    return new Vec3(
      this.data[0] * that.data[0],
      this.data[1] * that.data[1],
      this.data[2] * that.data[2],
    );
  }

  /**
   * Return a normalized version of this vector.
   *
   * For a vector of size zero, no direction can be determined, and the vector
   * itself is returned.
   *
   * @returns a new vector, pointing in the same direction, but with unit magnitude
   */
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

/**
 * Clamp a value between a min and max bounds
 *
 * If the value is too large, we end up with max, and if
 * it is too small, we end up with min.
 *
 * @param x the value to clamp
 * @param min the min value
 * @param max the max value
 */
export function clamp(x: number, min: number, max: number) {
  if (x < min) {
    return min;
  }
  if (x > max) {
    return max;
  }
  return x;
}
