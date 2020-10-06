const RESTING_TURNS_PER_SEC = 10;
const RESTING_PROBABILITY_PER_SEC = 20;

const setTurnsFromSec = (sec: number, fps: number) => Math.round(sec * fps);
const getProbabilityFromSec = (sec: number, fps: number) =>
  Math.round(sec / fps);

export class RestingManager {
  private restingTurns = 0;

  public rest(fps: number) {
    this.restingTurns = this.restingTurns
      ? Math.max(this.restingTurns - 1, 0)
      : setTurnsFromSec(RESTING_TURNS_PER_SEC, fps);
  }

  public shouldRest(fps: number) {
    return (
      this.restingTurns ||
      (!this.restingTurns &&
        Math.random() * 100 <
          getProbabilityFromSec(RESTING_PROBABILITY_PER_SEC, fps))
    );
  }
}
