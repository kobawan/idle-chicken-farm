const MOVEMENT_PX = 2;
const RESTING_TURNS = 15;
const RESTING_PROBABILITY = 10;

interface ChickenProps {
  imgs: HTMLImageElement[];
  width: number;
  height: number;
  ctx: CanvasRenderingContext2D;
}

export class Chicken {
  imgs: HTMLImageElement[];
  width: number;
  height: number;
  ctx: CanvasRenderingContext2D;
  imgIndex: number;
  top: number;
  left: number;
  currentImg: HTMLImageElement;
  restingTurns: number;

  constructor({ imgs, width, height, ctx }: ChickenProps) {
    this.imgs = imgs;
    this.width = width;
    this.height = height;
    this.ctx = ctx;
    this.imgIndex = 0;
    this.currentImg = this.imgs[this.imgIndex];
    this.top = Math.round(Math.random() * (this.height - this.imgs[0].naturalHeight));
    this.left = Math.round(Math.random() * (this.width - this.imgs[0].naturalWidth));
    this.restingTurns = 0;
  }

  public update() {
    if(this.shouldRest()) {
      this.rest()
    } else {
      this.walk()
    }
    
    this.draw();
  }

  private draw() {
    this.ctx.drawImage(
      this.currentImg,
      0,
      0,
      this.currentImg.naturalWidth,
      this.currentImg.naturalHeight,
      this.left,
      this.top,
      this.currentImg.naturalWidth,
      this.currentImg.naturalHeight
    );
  }

  private updatePosition() {
    const dx = Math.round(Math.random() * 1);
    const dy = Math.round(Math.random() * 1);

    this.top = dy
      ? Math.min(this.top + MOVEMENT_PX, this.height - this.currentImg.naturalHeight)
      : Math.max(this.top - MOVEMENT_PX, 0)
    ;

    this.left = dx
      ? Math.min(this.left + MOVEMENT_PX, this.width - this.currentImg.naturalWidth)
      : Math.max(this.left - MOVEMENT_PX, 0)
    ;
  }

  private walk() {
    this.currentImg = this.imgs[this.imgIndex];
    this.imgIndex = this.imgIndex + 1 >= this.imgs.length - 1 ? 0 : this.imgIndex + 1;

    this.updatePosition();
  }

  private shouldRest() {
    return this.restingTurns || (!this.restingTurns && (Math.random() * 100) < RESTING_PROBABILITY);
  }

  private rest() {
    this.currentImg = this.imgs[this.imgs.length - 1];
    this.restingTurns = this.restingTurns
      ? Math.max(this.restingTurns - 1, 0)
      : RESTING_TURNS;
  }
}
