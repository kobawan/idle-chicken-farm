// GENERAL
export const SAVING_INTERVAL = 5000;
export const LOADING_PAGE_MIN_MS = 1000;
export const SCREEN_PADDING_PX = 5;

// CANVAS ITEMS
export const RESIZE_BY = 2;

// FOOD
export const FOOD_MAX_DISTANCE_PX = 300;
export const FOOD_MAX_EATERS = 3;
export const FOOD_MAX_METER = 30;
export const FOOD_CANVAS_FRAME_THROTTLE = 30;

// CHICKEN
export const CHICKEN_MIN_HUNGER = 30;
export const CHICKEN_MIN_DISTANCE_TO_EAT = 5;
export const CHICKEN_HUNGER_THRESHOLD = process.env.NODE_ENV === "development" ? 2000 : 60000; // every 1 min hunger will increase
export const CHICKEN_MOVEMENT_PX = 2;
export const CHICKEN_RESTING_TURNS_PER_SEC = 10;
export const CHICKEN_RESTING_PROBABILITY_PER_SEC = 20;
export const CHICKEN_REFRESH_RATE = 500;
