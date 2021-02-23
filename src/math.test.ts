import { Color, Mat4 } from './math';

test('color creation', () => {
  let components = [...new Color(0.0, 0.5, 1.0, 0.0)];
  expect(components).toEqual([0.0, 0.5, 1.0, 0.0]);
  components = [...new Color(0.0, 0.5, 1.0)];
  expect(components).toEqual([0.0, 0.5, 1.0, 1.0]);
});

test('matrix multiplication', () => {
  expect(Mat4.identity().mul(Mat4.identity())).toEqual(Mat4.identity());
  const scale = Mat4.scale(0.5, 0.25, 1.0);
  expect(scale.mul(Mat4.identity())).toEqual(scale);
  expect(Mat4.identity().mul(scale)).toEqual(scale);
  const rot = Mat4.rotZ(90);
  expect(rot.mul(Mat4.identity())).toEqual(rot);
  expect(Mat4.identity().mul(rot)).toEqual(rot);
});

test('matrix inversion', () => {
  expect(Mat4.identity().inv_olt().approxEqual(Mat4.identity())).toBe(true);

  const rot = Mat4.rotX(30).mul(Mat4.rotY(30)).mul(Mat4.rotZ(30));
  expect(rot.inv_olt().mul(rot).approxEqual(Mat4.identity())).toBe(true);

  const scale = Mat4.scale(0.25, 0.5, 0.4);
  expect(scale.inv_olt().mul(scale).approxEqual(Mat4.identity())).toBe(true);

  const scaleRot = scale.mul(rot);
  expect(scaleRot.inv_olt().mul(scaleRot).approxEqual(Mat4.identity())).toBe(
    true,
  );
});
