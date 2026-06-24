import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    cli: "src/cli.ts",
  },
  format: ["esm"],
  target: "node18",
  outDir: "dist",
  clean: true,
  dts: true,
  sourcemap: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
});
