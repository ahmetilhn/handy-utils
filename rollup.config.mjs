import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { dts } from "rollup-plugin-dts";

// TypeScript alone handles compilation to the tsconfig target.
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
