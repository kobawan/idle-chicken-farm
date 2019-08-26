const MOVEMENT_PX = 2;

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

  constructor({ imgs, width, height, ctx }: ChickenProps) {
    this.imgs = imgs;
    this.width = width;
    this.height = height;
    this.ctx = ctx;
    this.imgIndex = 0;
    this.currentImg = this.imgs[this.imgIndex];
    this.top = Math.round(Math.random() * (this.height - this.imgs[0].naturalHeight));
    this.left = Math.round(Math.random() * (this.width - this.imgs[0].naturalWidth));
  }

  public update() {
    this.currentImg = this.imgs[this.imgIndex];
    this.imgIndex = this.imgIndex + 1 >= this.imgs.length - 1 ? 0 : this.imgIndex + 1;

    this.updatePosition();
    
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
    const rand = Math.round(Math.random() * 3);

    switch(rand) {
      case 0:
        this.top = Math.max(this.top - MOVEMENT_PX, 0);
        break;
      case 1:
        this.left = Math.min(
          this.left + MOVEMENT_PX,
          this.width - this.currentImg.naturalWidth,
        );
        break;
      case 2:
        this.top = Math.min(
          this.top + MOVEMENT_PX,
          this.height - this.currentImg.naturalHeight,
        );
        break;
      case 3:
        this.left = Math.max(this.left - MOVEMENT_PX, 0);
        break;
      default:
        console.error("Update position random number out of bounds");
        break;
    }
  }
}
