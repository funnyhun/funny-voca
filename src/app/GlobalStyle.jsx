import { createGlobalStyle, css } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root {
    /* 테마 값을 CSS 변수로 주입 (성능 최적화 핵심) */
    --bg-color: ${({ theme }) => theme.background};
    --font-color: ${({ theme }) => theme.font};
    --sub-color: ${({ theme }) => theme.sub};
    
    font-size: 14px;
    font-family: 'Noto Sans', sans-serif;
  }

  /* 반응형 폰트 사이즈 (중복 제거) */
  @media (min-width: 375px) { :root { font-size: 16px; } }
  @media (min-width: 768px) { :root { font-size: 18px; } }
  @media (min-width: 1024px) { :root { font-size: 20px; } }

  /* 초기화 (필요한 것만 엄격하게) */
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }

  html, body, #root {
    height: 100%;
    width: 100%;
    /* 스크롤바 숨김은 여기서 한 번만 */
    overflow: overlay; 
    -ms-overflow-style: none;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }

  body {
    background-color: var(--bg-color);
    color: var(--font-color);
    font-size: 1rem;
    line-height: 1.5;
    user-select: none;
    touch-action: manipulation;
    -webkit-font-smoothing: antialiased;
  }

  /* 타이포그래피 계층화 */
  h1, h2, h3, h4, h5, h6 { font-weight: 600; line-height: 1.2; }
  h1 { font-size: 2.5rem; }
  h2 { font-size: 2rem; }
  h3 { font-size: 1.5rem; }

  /* 폼 요소 초기화 */
  input, button, select, textarea {
    font: inherit;
    color: inherit;
    border: none;
    background: none;
  }

  button { cursor: pointer; }
  ul, ol { list-style: none; }
  a { text-decoration: none; color: inherit; }

  /* 아이콘 최적화 */
  svg {
    display: inline-block;
    vertical-align: middle;
    width: 1.5rem;
    height: 1.5rem;
    fill: var(--sub-color);
    flex-shrink: 0;
  }
`;
