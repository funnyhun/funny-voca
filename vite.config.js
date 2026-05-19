import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import vitePluginSvgr from "vite-plugin-svgr";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const config = {
    plugins: [react(), vitePluginSvgr(), basicSsl()],
    base: mode === "production" ? "./" : "/",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      https: true,
    },
  };

  return config;
});
