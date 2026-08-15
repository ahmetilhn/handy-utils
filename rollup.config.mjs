import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { dts } from "rollup-plugin-dts";

// TypeScript alone handles compilation to the tsconfig target. Running babel
// afterwards used to merge the root babel.config.js (targets: node current), so
// the published bundle was compiled for whichever Node version happened to
// build it.
export default [
  {
    input: "./lib/index.ts",
    output: {
      file: "./build/index.js",
      format: "cjs",
      exports: "named",
      sourcemap: true,
    },
    plugins: [typescript({ tsconfig: "./tsconfig.json" }), terser()],
  },
  {
    input: "./lib/index.ts",
    output: [{ file: "./build/index.d.ts", format: "es" }],
    plugins: [dts({ tsconfig: "./tsconfig.json" })],
  },
];
