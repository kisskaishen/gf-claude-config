/** @type {import("stylelint").Config} */
export default {
  extends: [
    "stylelint-config-standard",
    "stylelint-config-standard-scss",
    "stylelint-config-recommended-vue/scss",
    "stylelint-config-recess-order"
  ],
  plugins: ["stylelint-order"],
  rules: {
    "no-descending-specificity": null,
    "no-empty-source": null,
    "font-family-no-missing-generic-family-keyword": null,
    "scss/at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "mixin",
          "extend",
          "content",
          "include",
          "forward",
          "use"
        ]
      }
    ],
    "selector-class-pattern": null, // 允许驼峰等命名
    "custom-property-pattern": null,
    "scss/dollar-variable-pattern": null,
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: ["deep", "global"]
      }
    ]
  },
  ignoreFiles: ["**/*.js", "**/*.ts", "**/*.tsx", "**/*.jsx"]
};
