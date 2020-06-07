import PolynomialRegression from 'js-polynomial-regression';

export const generatePolynomialRegression = (data, degree) => {
  const model = PolynomialRegression.read(data, degree);
  return model;
};

export default {
  generatePolynomialRegression,
};
