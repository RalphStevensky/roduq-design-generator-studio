import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    environment: "node",
    testTimeout: 15_000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "schemas/**/*.json",
        "skills/**/SKILL.md",
        "design-systems/roduq-*/**/*",
      ],
    },
  },
});
