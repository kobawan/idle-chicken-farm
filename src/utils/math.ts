export const isInRange = ({ min, max, value }: { min: number; max: number; value: number }) => {
  return value >= min && value <= max;
};

export const getValueWithinRange = ({
  min,
  max,
  value,
}: {
  min: number;
  max: number;
  value: number;
}) => {
  return Math.max(min, Math.min(max, value));
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getRandomValue = (limit = 1) => {
  return Math.round(Math.random() * limit);
};
