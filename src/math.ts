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
