import { useState, useEffect } from "react";
import * as S from "./NumberDisplay.styles";

export const NumberDisplay = ({ second }) => {
  const [count, setCount] = useState(second);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return <S.Display>{count}</S.Display>;
};
