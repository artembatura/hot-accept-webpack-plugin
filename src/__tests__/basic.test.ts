import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';
import webpackV5, { Stats } from 'webpack';
import webpackV4 from 'webpack4';

import { HotAcceptPlugin } from '../HotAcceptPlugin';
import DoneCallback = jest.DoneCallback;

const OUTPUT_PATH = path.resolve(__dirname, './build/basic-test');
const OUTPUT_BUNDLE = 'bundle.js';

function testPlugin(
  webpack: any,
  webpackConfig: any,
  done: DoneCallback,
  expectModulesContent: Array<{
    module: string;
    shouldContain?: Array<string | [RegExp, number]>;
    shouldEqual?: string;
  }>,
  expectBundleContent?: Array<string | [RegExp, number]>,
  expectErrors?: boolean,
  expectWarnings?: boolean
): void {
  webpack(webpackConfig, (err: Record<string, any> | false, stats: Stats) => {
    expect(err).toBeFalsy();

    const compilationErrors = (stats?.compilation.errors || []).join('\n');

    if (expectErrors) {
      expect(compilationErrors).not.toBe('');
    } else {
      expect(compilationErrors).toBe('');
    }

    const compilationWarnings = (stats?.compilation.warnings || []).join('\n');

    if (expectWarnings) {
      expect(compilationWarnings).not.toBe('');
    } else {
      expect(compilationWarnings).toBe('');
    }

    expectModulesContent.forEach(expectedContent => {
      const { module, shouldContain, shouldEqual } = expectedContent;

      const modulePath = getModulePath(module);
      const modules = Array.from(stats?.compilation.modules?.values() || []);
      const moduleMeta = modules.find(
        module => (module as any).resource === modulePath
      );

      expect(moduleMeta).toBeTruthy();

      const originalSource = moduleMeta?.originalSource();

      const moduleSource = originalSource
        ? originalSource.source().toString()
        : undefined;

      if (shouldEqual) {
        expect(moduleSource).toEqual(shouldEqual);
      }

      shouldContain?.forEach(containItem => {
        if (Array.isArray(containItem)) {
          const [regExp, matchCount] = containItem;

          if (matchCount === 0) {
            return expect(moduleSource?.match(regExp)).toBe(null);
          }

          return expect(moduleSource?.match(regExp)).toHaveLength(matchCount);
        }

        expect(moduleSource).toContain(containItem);
      });
    });

    const bundleContent = fs
      .readFileSync(OUTPUT_PATH + '/' + OUTPUT_BUNDLE)
      .toString();

    const _expectBundleContent =
      expectBundleContent ||
      expectModulesContent.map(expectMeta => expectMeta.shouldContain).flat();

    // also check bundle content
    _expectBundleContent.forEach(expectedContent => {
      if (!expectedContent) {
        return;
      }

      if (Array.isArray(expectedContent)) {
        const [regExp, matchCount] = expectedContent;

        if (matchCount === 0) {
          return expect(bundleContent.match(regExp)).toBe(null);
        }

        return expect(bundleContent.match(regExp)).toHaveLength(matchCount);
      }

      expect(bundleContent).toContain(expectedContent);
    });

    done();
  });
}

function getModulePath(fileName: string): string {
  return path.join(__dirname, `fixtures/${fileName}`);
}

const modify = (src: string) =>
  src + 'if (module.hot) { module.hot.accept(); }';

function runTests(webpack: typeof webpackV4 | typeof webpackV5) {
  beforeEach(done => {
    rimraf(OUTPUT_PATH, done);
  });

  it('modifies index.js by regexp', done => {
    testPlugin(
      webpack,
      {
        mode: 'development',
        entry: path.join(__dirname, 'fixtures/index.js'),
        output: {
          path: OUTPUT_PATH,
          filename: OUTPUT_BUNDLE
        },
        plugins: [
          new webpack.HotModuleReplacementPlugin(),
          new HotAcceptPlugin({
            test: /index\.js$/
          })
        ]
      },
      done,
      [
        {
          module: 'index.js',
          shouldContain: [[/if \(module.hot\) { module.hot.accept\(\); }/g, 1]],
          shouldEqual: modify(
            fs.readFileSync(getModulePath('index.js')).toString()
          )
        },
        {
          module: 'one-module.js',
          shouldContain: [[/if \(module.hot\) { module.hot.accept\(\); }/g, 0]],
          shouldEqual: fs
            .readFileSync(getModulePath('one-module.js'))
            .toString()
        },
        {
          module: 'two-module.js',
          shouldContain: [[/if \(module.hot\) { module.hot.accept\(\); }/g, 0]],
          shouldEqual: fs
            .readFileSync(getModulePath('two-module.js'))
            .toString()
        }
      ],
      [[/if \(true\) { module.hot.accept\(\); }/g, 1]]
    );
  });

  it('modifies one-module.js by regexp', done => {
    testPlugin(
      webpack,
      {
        mode: 'development',
        entry: path.join(__dirname, 'fixtures/index.js'),
        output: {
          path: OUTPUT_PATH,
          filename: OUTPUT_BUNDLE
        },
        plugins: [
          new webpack.HotModuleReplacementPlugin(),
          new HotAcceptPlugin({
            test: /one-module\.js$/
          })
        ]
      },
      done,
      [
        {
          module: 'index.js',
          shouldContain: [[/if \(module.hot\) { module.hot.accept\(\); }/g, 0]],
          shouldEqual: fs.readFileSync(getModulePath('index.js')).toString()
        },
        {
          module: 'one-module.js',
          shouldContain: [[/if \(module.hot\) { module.hot.accept\(\); }/g, 1]],
          shouldEqual: modify(
            fs.readFileSync(getModulePath('one-module.js')).toString()
          )
        },
        {
          module: 'two-module.js',
          shouldContain: [[/if \(module.hot\) { module.hot.accept\(\); }/g, 0]],
          shouldEqual: fs
            .readFileSync(getModulePath('two-module.js'))
            .toString()
        }
      ],
      [[/if \(true\) { module.hot.accept\(\); }/g, 1]]
    );
  });

  it('modifies index.js by string', done => {
    testPlugin(
      webpack,
      {
        mode: 'development',
        entry: path.join(__dirname, 'fixtures/index.js'),
        output: {
          path: OUTPUT_PATH,
          filename: OUTPUT_BUNDLE
        },
        plugins: [
          new webpack.HotModuleReplacementPlugin(),
          new HotAcceptPlugin({
            test: 'index.js'
          })
        ]
      },
      done,
      [
        {
          module: 'index.js',
          shouldContain: [[/if \(module.hot\) { module.hot.accept\(\); }/g, 1]],
          shouldEqual: modify(
            fs.readFileSync(getModulePath('index.js')).toString()
          )
        },
        {
          module: 'one-module.js',
          shouldContain: [[/if \(module.hot\) { module.hot.accept\(\); }/g, 0]],
          shouldEqual: fs
            .readFileSync(getModulePath('one-module.js'))
            .toString()
        },
        {
          module: 'two-module.js',
          shouldContain: [[/if \(module.hot\) { module.hot.accept\(\); }/g, 0]],
          shouldEqual: fs
            .readFileSync(getModulePath('two-module.js'))
            .toString()
        }
      ],
      [[/if \(true\) { module.hot.accept\(\); }/g, 1]]
    );
  });

  it('modifies all modules', done => {
    testPlugin(
      webpack,
      {
        mode: 'development',
        entry: path.join(__dirname, 'fixtures/index.js'),
        output: {
          path: OUTPUT_PATH,
          filename: OUTPUT_BUNDLE
        },
        plugins: [
          new webpack.HotModuleReplacementPlugin(),
          new HotAcceptPlugin({
            test: /.+\.js$/
          })
        ]
      },
      done,
      [
        {
          module: 'index.js',
          shouldContain: [[/if \(module.hot\) { module.hot.accept\(\); }/g, 1]],
          shouldEqual: modify(
            fs.readFileSync(getModulePath('index.js')).toString()
          )
        },
        {
          module: 'one-module.js',
          shouldContain: [[/if \(module.hot\) { module.hot.accept\(\); }/g, 1]],
          shouldEqual: modify(
            fs.readFileSync(getModulePath('one-module.js')).toString()
          )
        },
        {
          module: 'two-module.js',
          shouldContain: [[/if \(module.hot\) { module.hot.accept\(\); }/g, 1]],
          shouldEqual: modify(
            fs.readFileSync(getModulePath('two-module.js')).toString()
          )
        }
      ],
      [[/if \(true\) { module.hot.accept\(\); }/g, 3]]
    );
  });

  it('modifies one-module.js file by regexp path', done => {
    testPlugin(
      webpack,
      {
        mode: 'development',
        entry: path.join(__dirname, 'fixtures/index.js'),
        output: {
          path: OUTPUT_PATH,
          filename: OUTPUT_BUNDLE
        },
        plugins: [
          new webpack.HotModuleReplacementPlugin(),
          new HotAcceptPlugin({
            test: /fixtures\/one-module\.js$/
          })
        ]
      },
      done,
      [
        {
          module: 'index.js',
          shouldContain: [[/if \(module.hot\) { module.hot.accept\(\); }/g, 0]],
          shouldEqual: fs.readFileSync(getModulePath('index.js')).toString()
        },
        {
          module: 'one-module.js',
          shouldContain: [[/if \(module.hot\) { module.hot.accept\(\); }/g, 1]],
          shouldEqual: modify(
            fs.readFileSync(getModulePath('one-module.js')).toString()
          )
        },
        {
          module: 'two-module.js',
          shouldContain: [[/if \(module.hot\) { module.hot.accept\(\); }/g, 0]],
          shouldEqual: fs
            .readFileSync(getModulePath('two-module.js'))
            .toString()
        }
      ],
      [[/if \(true\) { module.hot.accept\(\); }/g, 1]]
    );
  });

  it('modifies multiple files by array as test', done => {
    testPlugin(
      webpack,
      {
        mode: 'development',
        entry: path.join(__dirname, 'fixtures/index.js'),
        output: {
          path: OUTPUT_PATH,
          filename: OUTPUT_BUNDLE
        },
        plugins: [
          new webpack.HotModuleReplacementPlugin(),
          new HotAcceptPlugin({
            test: [
              'index.js',
              /fixtures\/two-module\.js$/,
              'fixtures/one-module.js'
            ]
          })
        ]
      },
      done,
      [
        {
          module: 'index.js',
          shouldContain: [[/if \(module.hot\) { module.hot.accept\(\); }/g, 1]],
          shouldEqual: modify(
            fs.readFileSync(getModulePath('index.js')).toString()
          )
        },
        {
          module: 'one-module.js',
          shouldContain: [[/if \(module.hot\) { module.hot.accept\(\); }/g, 1]],
          shouldEqual: modify(
            fs.readFileSync(getModulePath('one-module.js')).toString()
          )
        },
        {
          module: 'two-module.js',
          shouldContain: [[/if \(module.hot\) { module.hot.accept\(\); }/g, 1]],
          shouldEqual: modify(
            fs.readFileSync(getModulePath('two-module.js')).toString()
          )
        }
      ],
      [[/if \(true\) { module.hot.accept\(\); }/g, 3]]
    );
  });
}

describe('HotAcceptPlugin::webpack-v5', () => {
  runTests(webpackV5);
});

describe('HotAcceptPlugin::webpack-v4', () => {
  runTests(webpackV4);
});
