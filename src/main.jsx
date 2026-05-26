import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AppRouter } from "@/ui/app/router/router";

import { ThemeProvider as MyThemeProvider } from "@/ui/hooks";
import { GlobalStyle } from "@/ui/app/GlobalStyle";


createRoot(document.getElementById("root")).render(
  //   <StrictMode>
  <MyThemeProvider>
    <GlobalStyle />
    <AppRouter />
  </MyThemeProvider>
  //   </StrictMode>
);
