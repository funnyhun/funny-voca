import { createGlobalStyle, css } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root {
    /* 테마 값을 CSS 변수로 주입 (성능 최적화 핵심) */
    --bg-color: ${({ theme }) => theme.bg_app};
    --font-color: ${({ theme }) => theme.text_main};
    --sub-color: ${({ theme }) => theme.text_muted};
    
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
    overscroll-behavior-y: none;
    overflow: overlay; 
    -ms-overflow-style: none;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }

  html {
    background-color: var(--header-bottom-bg, #ffffff);
    transition: background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }

  body {
    position: relative;
    min-height: 100dvh;

    background-color: var(--header-bottom-bg, #ffffff);
    transition: background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1);
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

  button,
  [role="button"] {
    cursor: pointer;
  }

  [role="button"] {
    user-select: none;
    transition: opacity 0.2s ease, transform 0.1s ease;

    &:hover {
      opacity: 0.85;
    }

    &:active {
      transform: scale(0.97);
    }

    &:focus-visible {
      outline: 2px solid ${({ theme }) => theme.brand || "var(--sub-color)"};
      outline-offset: 2px;
    }
  }

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
