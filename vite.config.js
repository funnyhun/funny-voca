import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import vitePluginSvgr from "vite-plugin-svgr";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const config = {
    plugins: [react(), vitePluginSvgr(), basicSsl()],
    base: env.VITE_BASE_PATH || "/",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@app": path.resolve(__dirname, "./src/app"),
        "@api": path.resolve(__dirname, "./src/api"),
      },
    },
    server: {
      https: true,
    },
  };

  return config;
});
