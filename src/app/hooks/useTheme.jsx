import { useState, createContext, useContext, useEffect, useCallback } from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";

import { LightTheme, DarkTheme } from "@/app/theme";
import { getStorage, setStorage, KEYS } from "@/utils/storage";

const themeContext = createContext({
  theme: "light",
  handleTheme: () => {},
});

const loadTheme = () => {
  const theme = getStorage(KEYS.THEME);
  if (theme === null) return "light";
  return theme;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(loadTheme());

  useEffect(() => {
    setStorage(KEYS.THEME, theme);

    // HTML 메타 태그 theme-color 동적 연동 (노치 및 상태바 일괄 적용)
    const currentThemeData = theme === "light" ? LightTheme : DarkTheme;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", currentThemeData.background);
    }
  }, [theme]);

  const handleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  return (
    <themeContext.Provider value={{ theme, handleTheme }}>
      <StyledThemeProvider theme={theme === "light" ? LightTheme : DarkTheme}>{children}</StyledThemeProvider>
    </themeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(themeContext);
};
