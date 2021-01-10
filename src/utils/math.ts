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
