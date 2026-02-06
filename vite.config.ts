import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  // base: process.env.NODE_ENV === "production" ? "csd-gfuc-web/" : "/",
  plugins: [
    vue(),
    AutoImport({
      imports: ["vue", "vue-router", "pinia"],
      resolvers: [
        ElementPlusResolver({
          importStyle: "sass"
        })
      ],
      eslintrc: {
        enabled: true,
        filepath: "./.eslintrc-auto-import.json",
        globalsPropValue: true
      },
      dts: true
    }),
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: "sass"
        })
      ]
    }),
    createSvgIconsPlugin({
      // 指定需要缓存的图标文件夹
      iconDirs: [path.resolve(process.cwd(), "src/assets/svg-icons")],
      // 指定symbolId格式
      symbolId: "icon-[dir]-[name]"
    }),
    {
      name: "html-transform",
      transformIndexHtml(html) {
        const buildTime = new Date().toLocaleString("zh-CN", {
          timeZone: "Asia/Shanghai",
          hour12: false
        });
        return html.replace(
          "</head>",
          `  <meta name="build-time" content="${buildTime}">\n    <!-- Build Time: ${buildTime} -->\n  </head>`
        );
      }
    }
  ],
  resolve: {
    alias: {
      "@": "/src"
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/element/index.scss" as *;`
      }
    }
  },
  server: {
    proxy: {
      "/api/gfuc": {
        target: "http://127.0.0.1:4523/m1/7052181-6772291-default",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "")
      }
      // "/api/gfuc": {
      //   target: "http://10.80.8.17:7777",
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, "")
      // }
      // "/api/gfuc": {
      //   target: "http://192.168.104.124:7777",
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, "")
      // }
      // "/api/gfuc": {
      //   target: "http://10.100.5.180:32633",
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, "")
      // }
    }
  }
});
