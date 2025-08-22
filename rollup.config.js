import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

const isProduction = process.env.NODE_ENV === 'production';

export default [
  // ES Module build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      nodeResolve(),
      typescript({
        declaration: true,
        declarationDir: 'dist',
        outDir: 'dist',
        skipLibCheck: true
      }),
      isProduction && terser()
    ].filter(Boolean)
  },
  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      nodeResolve(),
      typescript({
        declaration: false,
        outDir: 'dist',
        skipLibCheck: true
      }),
      isProduction && terser()
    ].filter(Boolean)
  },
  // UMD build for browsers
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'EnvManager',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      nodeResolve(),
      typescript({
        declaration: false,
        outDir: 'dist',
        skipLibCheck: true
      }),
      isProduction && terser()
    ].filter(Boolean)
  }
];