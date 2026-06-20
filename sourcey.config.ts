import { defineConfig, openapi } from "sourcey";

export default defineConfig({
  name: "GitHub REST API — Gists Reference",
  description: "Independent Sourcey reference generated from GitHub's maintained REST API description.",
  navigation: {
    tabs: [
      { tab: "Gists", source: openapi("./generated/gists-core.yaml") },
      { tab: "Gist management", source: openapi("./generated/gists-management.yaml") },
    ],
  },
  theme: {
    preset: "api-first",
    colors: {
      primary: "#1bd96a",
      light: "#62e993",
      dark: "#0f9e4b",
    },
  },
});
