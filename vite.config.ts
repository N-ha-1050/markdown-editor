import { fileURLToPath, URL } from "node:url"
import type { UserConfig } from "vite"

export default {
  base: "/",
  resolve: {
    alias: {
      "monaco-editor/esm": fileURLToPath(
        new URL("./node_modules/monaco-editor/esm", import.meta.url),
      ),
    },
  },
  optimizeDeps: {
    // Monaco Editor を Vite の事前バンドル対象から除外する
    exclude: ["monaco-editor"],
  },
} satisfies UserConfig
