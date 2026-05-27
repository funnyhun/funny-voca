import { createContext, useContext, useState, useEffect } from "react";
import { useTheme as useStyledTheme } from "styled-components";

// Overlay.styles.js의 background-color: rgba(0,0,0,OVERLAY_DIM_ALPHA)와 반드시 동기화
export const OVERLAY_DIM_ALPHA = 0.35;

/**
 * hex 색상과 rgba(0,0,0,alpha) 마스크의 알파 합성 결과를 rgb 문자열로 반환한다.
 * 헤더/바텀은 단색(solid) 배경이므로 backdrop-filter: blur를 거쳐도 색상이 변하지 않는다.
 * 따라서 단순 알파 합성 수식만으로 최종 픽셀 색상을 정밀하게 산출할 수 있다.
 *
 * 결과 = Background × (1 - alpha) + Black × alpha
 *      = Background × (1 - alpha)
 */
const calcDimmedColor = (hexColor, alpha) => {
  const hex = hexColor.replace("#", "");
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
 * isOverlay 상태 변경 시 두 가지 사이드이펙트를 자동으로 처리한다.
 *  1. --header-bottom-bg CSS 변수 전환
 *     - 평상시 : theme.main (헤더/바텀 고유 배경색)
 *     - 오버레이 ON : 딤드 합성 색상 (theme.main + rgba(0,0,0,OVERLAY_DIM_ALPHA) 알파 합성 결과)
 *  2. meta[name="theme-color"] 전환 (iOS 상태바/노치 색상 동기화)
 */
export const OverlayProvider = ({ children }) => {
  const [isOverlay, setIsOverlay] = useState(false);
  const theme = useStyledTheme();

  useEffect(() => {
    const targetColor = isOverlay
      ? calcDimmedColor(theme.main, OVERLAY_DIM_ALPHA)
      : theme.main;

    // 1. body 배경색 (노치 영역) 전환
    document.documentElement.style.setProperty("--header-bottom-bg", targetColor);

    // 2. 브라우저/iOS 상태바(theme-color) 동기화
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", targetColor);
    }
  }, [isOverlay, theme]);

  return (
    <OverlayContext.Provider value={{ isOverlay, setIsOverlay }}>
      {children}
    </OverlayContext.Provider>
  );
};

export const useOverlay = () => useContext(OverlayContext);
