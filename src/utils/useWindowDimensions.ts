import { useState, useEffect } from "react";
import debounce from "lodash.debounce";

export const useWindowDimensions = (resizeBy = 1) => {
  const [{ width, height }, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = debounce(
      () => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      },
      500,
      { trailing: true, leading: false },
    );
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return {
    canvasWidth: width / resizeBy,
    canvasHeight: height / resizeBy,
  };
};
