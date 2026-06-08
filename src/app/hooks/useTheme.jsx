import { useState, createContext, useContext, useEffect, useCallback } from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";

import { getTheme } from "@/app/theme";
import { getThemeCache, setThemeCache } from "@/api/common";

const themeContext = createContext({
  theme: "light",
  handleTheme: () => {},
});

const loadTheme = () => {
  const theme = getThemeCache();
  if (theme === null) return "light";
  return theme;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(loadTheme());

  useEffect(() => {
    setThemeCache(theme);

    // HTML 메타 태그 theme-color 동적 연동 (노치 및 상태바 일괄 적용)
    const currentThemeData = getTheme(theme);
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", currentThemeData.bg_app);
    }
  }, [theme]);

  const handleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  return (
    <themeContext.Provider value={{ theme, handleTheme }}>
      <StyledThemeProvider theme={getTheme(theme)}>{children}</StyledThemeProvider>
    </themeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(themeContext);
};
