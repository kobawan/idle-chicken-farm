export const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = () => reject();
  });
};

export const loadMultipleImages = (urls: string[]): Promise<HTMLImageElement[]> => {
  return Promise.all(urls.map((url) => loadImage(url)));
};
