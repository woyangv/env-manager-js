import { nodeResolve } from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

const isProduction = process.env.NODE_ENV === 'production';

export default [
  // ES Module build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: [
          ['@babel/preset-env', {
            modules: false,
            targets: {
              browsers: ['> 1%', 'last 2 versions', 'not dead']
            }
          }]
        ]
      }),
      isProduction && terser()
    ].filter(Boolean)
  },
  // CommonJS build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'auto'
    },
    plugins: [
      nodeResolve(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: [
          ['@babel/preset-env', {
            modules: false,
            targets: {
              node: '14'
            }
          }]
        ]
      }),
      isProduction && terser()
    ].filter(Boolean)
  },
  // UMD build for browsers
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'EnvManager',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: [
          ['@babel/preset-env', {
            modules: false,
            targets: {
              browsers: ['> 1%', 'last 2 versions', 'not dead']
            }
          }]
        ]
      }),
      isProduction && terser()
    ].filter(Boolean)
  }
];