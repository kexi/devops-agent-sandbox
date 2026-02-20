import tseslint from "typescript-eslint";

export default tseslint.config(
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    ignores: [
      "node_modules/",
      "dist/",
      "cdk.out/",
      "**/*.js",
      "**/*.mjs",
      "**/*.d.ts",
      "coverage/",
      "vitest.config.ts",
    ],
  },
);
