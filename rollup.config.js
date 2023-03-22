import { nodeResolve } from '@rollup/plugin-node-resolve'

function getConfig(opts) {
  if (opts == null) {
    opts = {}
  }

  const file = `./dist/token-zapper${opts.suffix || ''}.js`
  const exportConditions = ['default', 'module', 'import']
  const mainFields = ['module', 'main']
  if (opts.browser) {
    mainFields.unshift('browser')
  }

  return {
    input: './lib.esm/index.js',
    output: {
      file,
      banner:
        "const __$G = (typeof globalThis !== 'undefined' ? globalThis: typeof window !== 'undefined' ? window: typeof global !== 'undefined' ? global: typeof self !== 'undefined' ? self: {});",
      name: opts.name || undefined,
      format: opts.format || 'esm',
      sourcemap: true,
    },
    context: '__$G',
    treeshake: false,
    plugins: [
      nodeResolve({
        exportConditions,
        mainFields,
        modulesOnly: true,
        preferBuiltins: false,
      }),
    ],
  }
}

export default [
  getConfig({ browser: true }),
  getConfig({
    browser: true,
    suffix: '.umd',
    format: 'umd',
    name: '@reserve/token-zapper',
  }),
]
