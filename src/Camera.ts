import { AngleDeg, Mat4, Vec3 } from './math';

/**
 * Represents the Camera, which contains information about how we view the scene.
 */
export class Camera {
  /**
   * Construct a new camera.
   *
   * @param position the position of the camera, in the world
   * @param pitch the angle (degrees) of the camera, pitching it up or down
   * @param yaw the angle (degrees) of the camera, rotating around
   */
  constructor(
    public position: Vec3,
    public pitch: AngleDeg,
    public yaw: AngleDeg,
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
   * 
   * @param ar the aspect ratio of the screen
   */
  viewProjection(ar: number): Mat4 {
    const translate = Mat4.translation(
      this.position.x,
      this.position.y,
      this.position.z,
    );
    const rotate = Mat4.rotY(this.yaw).mul(Mat4.rotX(this.pitch));
    const view = translate.mul(rotate).invRigid();
    const project = Mat4.perspective(ar, 60, 0.1, 40.0);
    return project.mul(view);
  }

  /**
   * Returns the basis vectors relative to the camera.
   *
   * This is important, since as the camera moves around, the relative
   * directions change as well, and the movement of the character should match
   * the orientation of this camera.
   */
  relativeXYZ(): [Vec3, Vec3, Vec3] {
    const rotY = Mat4.rotY(this.yaw);
    return rotY.basis();
  }
}
