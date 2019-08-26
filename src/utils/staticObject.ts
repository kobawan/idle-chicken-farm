interface StaticObjectProps {
  img: HTMLImageElement;
  width: number;
  height: number;
  ctx: CanvasRenderingContext2D;
  top: number;
  left: number;
}

export class StaticObject {
  img: HTMLImageElement;
  width: number;
  height: number;
  ctx: CanvasRenderingContext2D;
  top: number;
  left: number;

  constructor({ img, width, height, ctx, top, left }: StaticObjectProps) {
    this.img = img;
    this.width = width;
    this.height = height;
    this.ctx = ctx;
    this.top = top;
    this.left = left;
  }

  public update() {
    this.draw();
  }

  private draw() {
    this.ctx.drawImage(
      this.img,
      0,
      0,
      this.img.naturalWidth,
      this.img.naturalHeight,
      this.left,
      this.top,
      this.img.naturalWidth,
      this.img.naturalHeight
    );
  }
}
