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
  expect(Mat4.identity().invRigid().approxEqual(Mat4.identity())).toBe(true);

  const rot = Mat4.rotX(30).mul(Mat4.rotY(30)).mul(Mat4.rotZ(30));
  expect(rot.invRigid().mul(rot).approxEqual(Mat4.identity())).toBe(true);

  const translate = Mat4.translation(1.0, 0.5, 0.25);
  expect(translate.invRigid().mul(translate).approxEqual(Mat4.identity())).toBe(true);

  const translateRot = translate.mul(rot);
  expect(translateRot.invRigid().mul(translate).mul(rot).approxEqual(Mat4.identity())).toBe(true);
  expect(translateRot.mul(translateRot.invRigid()).approxEqual(Mat4.identity())).toBe(true);
  expect(translateRot.invRigid().mul(translateRot).approxEqual(Mat4.identity())).toBe(true);
});
