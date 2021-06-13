interface Range {
  min: number;
  max: number;
  value: number;
}

export const isInRange = ({ min, max, value }: Range) => {
  return value >= min && value <= max;
};

export const getClosestValueWithinRange = ({ min, max, value }: Range) => {
  const distanceMin = Math.abs(value - min);
  const distanceMax = Math.abs(max - value);
  return distanceMax < distanceMin ? max : min;
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getRandomValue = (limit = 1) => {
  return Math.round(Math.random() * limit);
};
