import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollReset = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant", // use "smooth" if you want animation
    });
  }, [pathname]);

  return null;
};

export default ScrollReset;