/* eslint-disable implicit-arrow-linebreak */
import {defineConfig} from 'vite';
import {resolve} from 'path';
import {externalizeDeps} from 'vite-plugin-externalize-deps';
import externalizeSourceDependencies from '@blockquote/rollup-plugin-externalize-source-dependencies';

const outDir = process.env.OUTDIR || '.';

/**
 * https://vitejs.dev/config/
 * https://vite-rollup-plugins.patak.dev/
 */

export default defineConfig({
  test: {
    onConsoleLog(log, type) {
      if (log.includes('in dev mode')) {
        return false;
      }
    },
    ui: false,
    include: ['test/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    coverage: {
      provider: 'v8',
      reportsDirectory: `${outDir}/test/coverage/`,
      reporter: ['lcov', 'json', 'text-summary'],
      enabled: true,
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
      include: ['**/src/**/*'],
    },
    browser: {
      provider: 'playwright',
      enabled: true,
      name: 'chromium',
      headless: true,
    },
  },
  plugins: [
    externalizeSourceDependencies([
      /* @web/test-runner-commands needs to establish a web-socket
       * connection. It expects a file to be served from the
       * @web/dev-server. So it should be ignored by Vite */
      '/__web-dev-server__web-socket.js',
    ]),
    externalizeDeps(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      formats: ['es'],
    },
  },
});
