import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import fs from "node:fs";
import eslintConfigPrettier from "eslint-config-prettier/flat";

const autoImportGlobals = fs.existsSync("./.eslintrc-auto-import.json")
  ? JSON.parse(fs.readFileSync("./.eslintrc-auto-import.json", "utf-8"))
  : { globals: {} };

// 强制补充 Element Plus 常用全局变量，防止插件未生成
const epGlobals = {
  ElMessage: "readonly",
  ElMessageBox: "readonly",
  ElLoading: "readonly",
  ElNotification: "readonly"
};

autoImportGlobals.globals = {
  ...autoImportGlobals.globals,
  ...epGlobals
};

export default tseslint.config(
  {
    ignores: [
      "dist",
      "dist-ssr",
      "build",
      "coverage",
      "node_modules",
      "auto-imports.d.ts",
      "components.d.ts",
      ".eslintrc-auto-import.json",
      "public"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  eslintConfigPrettier,
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...(autoImportGlobals.globals || {})
      }
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-vars": "off"
    }
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser
      }
    },
    rules: {
      "vue/multi-word-component-names": "off"
    }
  }
);
