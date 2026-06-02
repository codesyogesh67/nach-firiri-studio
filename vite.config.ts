// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig as lovableConfig } from "@lovable.dev/vite-tanstack-config";
import { defineConfig, mergeConfig } from "vite";

const lovable = lovableConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
});

export default mergeConfig(
  lovable,
  defineConfig({
    plugins: [], // Wrangler needs to find this
  })
);
