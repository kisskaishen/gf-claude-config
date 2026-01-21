import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
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
  }
});
