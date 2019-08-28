import React, { useRef, useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import cx from "classnames";
import styles from "./imageGenerator.module.scss";
import { loadMultipleImages } from "../../utils/loadImages";

const MAX_CHUNKS = 400;

interface ImageChunks {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  dw: number;
  dh: number;
}

interface DrawImageOptions extends ImageChunks {
  img: CanvasImageSource;
  dx: number;
  dy: number;
}

interface GetImageChunksOptions {
  sizeWidth: number;
  sizeHeight: number;
  cols: number;
  rows: number;
}

interface GetAllChunksRandomlyOptions {
  resWidth: number;
  resHeight: number;
  imageChunks: ImageChunks[];
  imgs: HTMLImageElement[];
  sizeWidth: number;
  sizeHeight: number;
}

const getImageChunks = ({
  sizeHeight,
  sizeWidth,
  cols,
  rows,
}: GetImageChunksOptions) => {
  const commonOptions = {
    dw: sizeWidth,
    dh: sizeHeight,
    sw: sizeWidth,
    sh: sizeHeight,
  }
  let chunks: ImageChunks[] = [];
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

const getAllChunksRandomly = ({
  resWidth,
  resHeight, 
  sizeWidth,
  sizeHeight,
  imageChunks,
  imgs,
}: GetAllChunksRandomlyOptions): DrawImageOptions[] => {
  const cols = Math.ceil(resWidth / sizeWidth);
  const rows = Math.ceil(resHeight / sizeHeight);
  const chunk = [];

  for(let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const chunkIndex = imageChunks.length === 1
        ? 0
        : Math.floor(Math.random() * imageChunks.length);
      const imgIndex = imgs.length === 1
        ? 0
        : Math.floor(Math.random() * imgs.length);
      chunk.push({
        img: imgs[imgIndex],
        dx: i * sizeWidth,
        dy: j * sizeHeight,
        ...imageChunks[chunkIndex],
      });
    }
  }

  return chunk;
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
  const [files, setFiles] = useState<File[]>([]);
  const [shouldSplitImage, setShouldSplitImage] = useState(false);
  const [cols, setCols] = useState(1);
  const [rows, setRows] = useState(1);
  const [error, setError] = useState("");

  const {
    getRootProps,
    getInputProps,
  } = useDropzone({
    onDrop: useCallback((file: File[]) => setFiles(file), []),
    accept: "image/png, image/jpeg"
  });

  const removeFile = (name: string) => {
    setFiles(files.filter(file => file.name !== name));
  }

  const FileInfo = files.map((file, i) => {
    return (
      <span
        key={i}
        className={cx(styles.row, styles.fileName)}
        onClick={() => removeFile(file.name)}
      >
        {file.name}
      </span>
    );
  })

  useEffect(() => {
    if(!width || !height || !canvasRef.current) {
      return;
    }

    const ctx = canvasRef.current.getContext('2d');
    if(ctx) {
      ctx.clearRect(0, 0, width, height);
    }

    if(!files.length) {
      return;
    }
    if(cols > 30 || rows > 30 || ((cols || 1) * (rows || 1) > MAX_CHUNKS)) {
      setError("Image has too many chunks to split. Please lower column or row value");
      return;
    }

    readFiles(files)
      .then(urls => urls.filter(Boolean))
      .then(urls => loadMultipleImages(urls))
      .then(imgs => {
        if(!imgs.length || !canvasRef.current) {
          return;
        }
        const ctx = canvasRef.current.getContext('2d');
        if(!ctx) {
          return;
        }

        const sizeWidth = shouldSplitImage ? Math.floor(imgs[0].naturalWidth / cols) : imgs[0].naturalWidth;
        const sizeHeight = shouldSplitImage ? Math.floor(imgs[0].naturalHeight / rows) : imgs[0].naturalHeight;

        window.requestAnimationFrame(() => {
          ctx.clearRect(0, 0, width, height);
          getAllChunksRandomly({
            resHeight: height,
            resWidth: width,
            sizeWidth,
            sizeHeight,
            imageChunks: getImageChunks({ sizeWidth, sizeHeight, cols, rows }),
            imgs,
          }).forEach(({ img, sx, sy, sw, sh, dx, dy, dw, dh }) => {
            ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
          })
        });
      });
  }, [width, height, files, cols, rows, shouldSplitImage, canvasRef])

  const downloadImg = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    const src = canvasRef.current.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.href = src;
    anchor.download = `${width}x${height}-generated.png`;
    anchor.click();
  };

  const updateShouldSplit = () => {
    if(shouldSplitImage) {
      setCols(1);
      setRows(1);
    }
    setShouldSplitImage(!shouldSplitImage)
  }

  return (
    <div className={styles.wrapper}>
      {!!width && !!height && (
        <canvas ref={canvasRef} width={width} height={height}></canvas>
      )}
      <form className={styles.form} onChange={() => setError("")}>
        <h3 className={styles.title}>Image generator</h3>
        <div className={styles.content}>
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
          <div {...getRootProps()} className={cx(styles.row, styles.dropzone)}>
            <input {...getInputProps()} />
            <span>Drag 'n' drop some files here, or click to select files</span>
          </div>
          {FileInfo}
          <div className={styles.row}>
            <label className={styles.label}>Split sprites:</label>
            <input
              className={cx(styles.input, styles.checkbox)}
              type="checkbox"
              onChange={updateShouldSplit}
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
        </div>
        <div className={styles.footer}>
          <button
            onClick={downloadImg}
            disabled={!width || !height || !files.length || !!error}
            className={styles.downloadButton}
          >
            Download
          </button>
          {error && <span className={styles.error}>{error}</span>}
        </div>
      </form>
    </div>
  );
}