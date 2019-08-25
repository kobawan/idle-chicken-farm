import React, { useRef, useState, useEffect } from "react";
import cx from "classnames";
import styles from "./imageGenerator.module.scss";
import { loadImage } from "../../utils/loadImages";

const MAX_CHUNKS = 100;

interface ImageChunks {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  dw: number;
  dh: number;
}

interface DrawImageOptions extends ImageChunks {
  ctx: CanvasRenderingContext2D;
  img: CanvasImageSource;
  canvasWidth: number;
  canvasHeight: number;
  dx: number;
  dy: number;
}

interface GetImageChunksOptions {
  sizeWidth: number;
  sizeHeight: number;
  cols: number;
  rows: number;
}

interface RenderChunksRandomlyOptions {
  resWidth: number,
  resHeight: number,
  imageChunks: ImageChunks[],
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement;
  sizeWidth: number;
  sizeHeight: number;
}

const drawImage = async ({
  ctx,
  img,
  canvasWidth,
  canvasHeight,
  dx,
  dy,
  dw,
  dh,
  sx,
  sy,
  sw,
  sh,
}: DrawImageOptions) => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
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
        canvasWidth: resWidth,
        canvasHeight: resHeight,
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
  const [error, setError] = useState("");
  
  useEffect(() => {
    if(!width || !height || !imgs.length) {
      return;
    }
    if(cols * rows > MAX_CHUNKS) {
      setError("Image has too many chunks to split. Please lower column or row value");
      return;
    }

    readFiles(imgs)
      .then(urls => urls.filter(Boolean))
      .then(urls => loadImage(urls[0]))
      .then(img => {
        if(!img || !canvasRef.current) {
          return;
        }
        const ctx = canvasRef.current.getContext('2d');
        if(!ctx) {
          return;
        }

        const sizeWidth = shouldSplitImage ? Math.floor(img.naturalWidth / cols) : img.naturalWidth;
        const sizeHeight = shouldSplitImage ? Math.floor(img.naturalHeight / rows) : img.naturalHeight;

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

  }, [width, height, imgs, cols, rows, shouldSplitImage, canvasRef])

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
      <form className={styles.form} onChange={() => setError("")}>
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
          <label className={styles.label}>Split sprite</label>
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
          onClick={downloadImg}
          disabled={!width || !height || !imgs.length || !!error}
        >
          Download
        </button>
        {error && <span className={styles.error}>{error}</span>}
      </form>
    </div>
  );
}