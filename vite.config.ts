import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy"; // Import the static copy plugin

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: "src/data/data.csv", // Path to your CSV file
          dest: "data", // Destination folder in the build output
        },
      ],
    }),
  ],
  resolve: {
  alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
