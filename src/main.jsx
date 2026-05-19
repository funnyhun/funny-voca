import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AppRouter } from "@/app/router/router";

import { ThemeProvider as MyThemeProvider } from "@/common/hooks/useTheme";
import { GlobalStyle } from "@/app/GlobalStyle";


createRoot(document.getElementById("root")).render(
  //   <StrictMode>
  <MyThemeProvider>
    <GlobalStyle />
    <AppRouter />
  </MyThemeProvider>
  //   </StrictMode>
);
