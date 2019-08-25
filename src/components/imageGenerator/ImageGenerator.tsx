import React, { useRef, useState, useEffect } from "react";
import cx from "classnames";
import styles from "./imageGenerator.module.scss";

interface DrawImageOptions {
  ctx: CanvasRenderingContext2D;
  img: CanvasImageSource;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}
interface GetImageChunksOptions {
  sizeWidth: number;
  sizeHeight: number;
  cols: number;
  rows: number;
}
type DrawImage = (options: DrawImageOptions) => Promise<void>;

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`load ${url} failed`));
  });
};

const drawImage: DrawImage = async ({ ctx, img, dx, dy, dw, dh, sx, sy, sw, sh }) => {
  window.requestAnimationFrame(() => {
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  });
};

const getImageChunks = ({ sizeHeight, sizeWidth, cols, rows }: GetImageChunksOptions) => {
  const commonOptions = {
    dw: sizeWidth,
    dh: sizeHeight,
    sw: sizeWidth,
    sh: sizeHeight,
  }
  let chunks = [];
  for(let row = 0; row < rows; row++) {
    for(let col = 0; col < cols; col++) {
      chunks.push({
        ...commonOptions,
        sx: col * sizeWidth,
        sy: row * sizeHeight,
      })
    }
  }
  return chunks;
}

interface RenderChunksRandomlyOptions {
  resWidth: number,
  resHeight: number,
  imageChunks: Omit<DrawImageOptions, "dx"|"dy"|"ctx"|"img">[],
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement;
  sizeWidth: number;
  sizeHeight: number;
}
const renderChunksRandomly = async ({
  resWidth,
  resHeight,
  sizeWidth,
  sizeHeight,
  imageChunks,
  ctx,
  img,
}: RenderChunksRandomlyOptions) => {
  const cols = Math.ceil(resWidth / sizeWidth);
  const rows = Math.ceil(resHeight / sizeHeight);
  
  for(let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const chunkIndex = imageChunks.length === 1
        ? 0
        : Math.floor(Math.random() * imageChunks.length);
      drawImage({
        ctx,
        img,
        dx: i * sizeWidth,
        dy: j * sizeHeight,
        ...imageChunks[chunkIndex],
      });
    }
  }
}

const readFiles = (imgs: File[]): Promise<string[]> => {
  return Promise.all(imgs.map(file => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  }));
}

export const ImageGenerator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [imgs, setImgs] = useState<File[]>([]);
  const [shouldSplitImage, setShouldSplitImage] = useState(false);
  const [cols, setCols] = useState(1);
  const [rows, setRows] = useState(1);
  
  useEffect(() => {
    if(!canvasRef.current || !width || !height || !imgs.length) {
      return;
    }
    const ctx = canvasRef.current.getContext('2d');
    if(!ctx) {
      return;
    }

    readFiles(imgs)
      .then(urls => urls.filter(Boolean))
      .then(urls => loadImage(urls[0]))
      .then(img => {
        const sizeWidth = shouldSplitImage ? Math.floor(img.width / cols) : img.width;
        const sizeHeight = shouldSplitImage ? Math.floor(img.height / rows) : img.height;

        renderChunksRandomly({
          resHeight: height,
          resWidth: width,
          sizeWidth,
          sizeHeight,
          imageChunks: getImageChunks({ sizeWidth, sizeHeight, cols, rows }),
          ctx,
          img,
        })
      });

  }, [width, height, imgs, cols, rows])

  const downloadImg = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    const src = canvasRef.current.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.href = src;
    anchor.download = `${width}x${height}-generated.png`;
    anchor.click();
  };

  return (
    <div className={styles.wrapper}>
      {!!width && !!height && (
        <canvas ref={canvasRef} width={width} height={height}></canvas>
      )}
      <form className={styles.form}>
        <h3 className={styles.title}>Image generator</h3>
        <div className={styles.row}>
          <label className={styles.label}>Resolution Width</label>
          <input
            className={styles.input}
            type="number"
            onChange={(e) => setWidth(+e.currentTarget.value)}
            min={1}
          />
        </div>
        <div className={styles.row}>
          <label className={styles.label}>Resolution Height</label>
          <input
            className={styles.input}
            type="number"
            onChange={(e) => setHeight(+e.currentTarget.value)}
            min={1}
          />
        </div>
        <div className={styles.row}>
          <label className={styles.label}>Split image</label>
          <input
            className={cx(styles.input, styles.checkbox)}
            type="checkbox"
            onChange={() => setShouldSplitImage(!shouldSplitImage)}
          />
        </div>
        {shouldSplitImage && <>
          <div className={styles.row}>
            <label className={styles.label}>Columns</label>
            <input
              className={styles.input}
              type="number"
              onChange={(e) => setCols(+e.currentTarget.value)}
              min={1}
            />
          </div>
          <div className={styles.row}>
            <label className={styles.label}>Rows</label>
            <input
              className={styles.input}
              type="number"
              onChange={(e) => setRows(+e.currentTarget.value)}
              min={1}
            />
          </div>
        </>}
        <input
          type="file"
          className={styles.row}
          accept="image/png, image/jpeg"
          // multiple={true}
          onChange={(e) => setImgs(Array.from(e.currentTarget.files || []))}
        />
        <button
          className={styles.button}
          onClick={downloadImg}
          disabled={!width || !height || !imgs.length}
        >
          Download
        </button>
      </form>
    </div>
  );
}