import chickenNames from "../data/chickenNames.json";
import { Gender, ChickenNames } from "../types/types";
import { Chicken } from "../models/chicken/chicken";

export const getAvailableNames = (chickens: Chicken[]): ChickenNames => {
  const usedNames = chickens.map(({ name }) => name);

  return {
    female: chickenNames.female.filter((name) => !usedNames.includes(name)),
    male: chickenNames.male.filter((name) => !usedNames.includes(name)),
  };
};

export const generateName = (gender: Gender, availableNames: ChickenNames) => {
  const names = availableNames[gender].length ? availableNames[gender] : chickenNames[gender];
  const randomIndex = Math.min(Math.floor(Math.random() * names.length), names.length - 1);

  return names[randomIndex];
};
