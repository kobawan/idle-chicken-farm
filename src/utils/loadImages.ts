export const loadImage = (url: string): Promise<HTMLImageElement|undefined> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = () => resolve();
  });
};

export const loadMultipleImages = (urls: string[]): Promise<HTMLImageElement[]> => {
  return Promise.all(
    urls.map(url => loadImage(url))
  ).then(imgs => imgs.filter(Boolean)) as Promise<HTMLImageElement[]>;
}
