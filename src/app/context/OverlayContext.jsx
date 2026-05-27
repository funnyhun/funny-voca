import { createContext, useContext, useState, useEffect } from "react";
import { useTheme as useStyledTheme } from "styled-components";

// Overlay.styles.js의 background-color: rgba(0,0,0,OVERLAY_DIM_ALPHA)와 반드시 동기화
export const OVERLAY_DIM_ALPHA = 0.35;

/**
 * hex 색상과 rgba(0,0,0,alpha) 마스크의 알파 합성 결과를 rgb 문자열로 반환한다.
 * 3자리(#fff) 및 6자리(#ffffff) HEX 코드를 모두 지원하여 NaN 오류를 방지합니다.
 */
const calcDimmedColor = (hexColor, alpha) => {
  let hex = hexColor.replace("#", "");
  
  // 3자리 단축 HEX(예: "fff")를 6자리 HEX("ffffff")로 안전하게 확장
  if (hex.length === 3) {
    hex = hex.split("").map(char => char + char).join("");
  }

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const factor = 1 - alpha;
  return `rgb(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)})`;
};

const OverlayContext = createContext({
  isOverlay: false,
  setIsOverlay: () => {},
});

/**
 * OverlayProvider
 *
 * 오버레이 작동 시, 상/하단 기기 Safe Area 영역(body 배경색)이 
 * 내부 딤드 톤과 시각적으로 매끄럽게 동화되도록 --header-bottom-bg CSS 변수만 스마트하게 전환합니다.
 */
export const OverlayProvider = ({ children }) => {
  const [isOverlay, setIsOverlay] = useState(false);
  const theme = useStyledTheme();

  useEffect(() => {
    const targetColor = isOverlay
      ? calcDimmedColor(theme.main, OVERLAY_DIM_ALPHA)
      : theme.main;

    // document.documentElement(html) 수준에 CSS 변수를 동적으로 할당하여 html, body 양측에 상속시킵니다.
    document.documentElement.style.setProperty("--header-bottom-bg", targetColor);
  }, [isOverlay, theme]);

  return (
    <OverlayContext.Provider value={{ isOverlay, setIsOverlay }}>
      {children}
    </OverlayContext.Provider>
  );
};

export const useOverlay = () => useContext(OverlayContext);
