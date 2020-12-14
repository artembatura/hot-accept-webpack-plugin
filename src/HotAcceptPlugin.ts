import { ModifyModuleSourcePlugin, Option } from 'modify-source-webpack-plugin';
import type { compilation } from 'webpack';

export type Options = {
  test: string | RegExp | (string | RegExp)[];
};

interface NormalModule extends compilation.Module {
  request?: string;
  loaders?: Array<{
    loader: string;
    options?: any;
  }>;
}

export class HotAcceptPlugin extends ModifyModuleSourcePlugin {
  constructor(options: Options) {
    const modify: Option['modify'] = src =>
      src + 'if (module.hot) { module.hot.accept(); }';

    const arg = ([] as Array<Options['test']>)
      .concat(options.test)
      .map(optionTest => {
        if (typeof optionTest === 'string') {
          const test = (module: NormalModule) => {
            if (module.request) {
              return module.request.endsWith(optionTest);
            }

            return false;
          };

          return {
            modify,
            test
          };
        }

        return {
          modify,
          test: optionTest as RegExp
        };
      });

    super(arg);
  }
}
