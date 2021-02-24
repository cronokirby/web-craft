export default class Controls {
  private _left: boolean = false;
  private _right: boolean = false;
  private _up: boolean = false;
  private _down: boolean = false;
  private _forward: boolean = false;
  private _backward: boolean = false;
  private _mouseDx: number = 0.0;
  private _mouseDy: number = 0.0;

  get left(): boolean {
    return this._left;
  }

  get right(): boolean {
    return this._right;
  }

  get up(): boolean {
    return this._up;
  }

  get down(): boolean {
    return this._down;
  }

  get forward(): boolean {
    return this._forward;
  }

  get back(): boolean {
    return this._backward;
  }

  get mouseDx(): number {
    return this._mouseDx;
  }

  get mouseDy(): number {
    return this._mouseDy;
  }

  private onKey(key: string, down: boolean) {
    switch (key) {
      case 'w':
        this._forward = down;
        break;
      case 's':
        this._backward = down;
        break;
      case 'a':
        this._left = down;
        break;
      case 'd':
        this._right = down;
        break;
      case 'Shift':
        this._down = down;
        break;
      case ' ':
        this._up = down;
        break;
    }
  }

  onKeyDown(event: KeyboardEvent) {
    this.onKey(event.key, true);
  }

  onKeyUp(event: KeyboardEvent) {
    this.onKey(event.key, false);
  }

  onMouseMove(event: MouseEvent) {
    this._mouseDx = event.movementX;
    this._mouseDy = event.movementY;
  }

  /**
   * This should be called when input has been handled, to prepare
   * the state for the next frame.
   */
  onHandle() {
    this._mouseDx = 0.0;
    this._mouseDy = 0.0;
  }
}
