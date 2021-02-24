import { AngleDeg, Mat4, Vec3 } from './math';

const HEIGHT: number = 2;
const DEPTH: number = 2;

/**
 * Represents the Camera, which contains information about how we view the scene.
 */
export class Camera {
  constructor(
    public position: Vec3,
    public pitch: AngleDeg,
    public yaw: AngleDeg,
    private ar: number,
  ) {
    this.position = position;
    this.pitch = pitch;
    this.yaw = yaw;
  }

  /**
   * Calculate the view projection matrix.
   *
   * This moves things in the right position relative to the camera, and then projects
   * them, to add perspective, and what not.
   */
  viewProjection(): Mat4 {
    const translate = Mat4.translation(
      this.position.x,
      this.position.y,
      this.position.z,
    );
    const rotate = Mat4.rotX(this.pitch).mul(Mat4.rotY(this.yaw));
    const view = translate.mul(rotate).invRigid();
    const project = Mat4.perspective(this.ar, 60, 0.1, 10.0);
    return project.mul(view);
  }

  relativeX(): Vec3 {
    return Mat4.rotY(this.yaw).act(new Vec3(1, 0, 0))
  }

  relativeZ(): Vec3 {
    return Mat4.rotY(this.yaw).act(new Vec3(0, 0, 1))
  }
}
