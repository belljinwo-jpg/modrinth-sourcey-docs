import { defineConfig, openapi } from "sourcey";

export default defineConfig({
  name: "Modrinth API Reference",
  description: "Independent, source-generated reference for the public Modrinth API.",
  navigation: {
    tabs: [
      { tab: "Projects", source: openapi("./generated/projects-core.yaml") },
      { tab: "Project discovery", source: openapi("./generated/projects-discovery.yaml") },
      { tab: "Versions", source: openapi("./generated/versions.yaml") },
      { tab: "Version files", source: openapi("./generated/version-files.yaml") },
      { tab: "Users", source: openapi("./generated/users.yaml") },
      { tab: "Notifications", source: openapi("./generated/notifications.yaml") },
      { tab: "Threads", source: openapi("./generated/threads.yaml") },
      { tab: "Teams", source: openapi("./generated/teams.yaml") },
      { tab: "Tags", source: openapi("./generated/tags.yaml") },
      { tab: "Misc", source: openapi("./generated/misc.yaml") },
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
