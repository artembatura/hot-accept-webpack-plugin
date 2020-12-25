import { ModifySourcePlugin, Rule } from 'modify-source-webpack-plugin';
import type { compilation } from 'webpack';

export type Options = {
  test: string | RegExp | (string | RegExp)[];
  debug?: boolean;
};

interface NormalModule extends compilation.Module {
  request?: string;
  userRequest?: string;
  rawRequest?: string;
  loaders?: Array<{
    loader: string;
    options?: any;
  }>;
}

function createRule(test: string | RegExp, modify: Rule['modify']): Rule {
  if (typeof test === 'string') {
    const testFn = (module: NormalModule) => {
      if (module.userRequest) {
        return module.userRequest.endsWith(test);
      }

      return false;
    };

    return {
      test: testFn,
      modify
    };
  }

  return {
    test,
    modify
  };
}

export class HotAcceptPlugin extends ModifySourcePlugin {
  constructor(options: Options) {
    const modify = (src: string) =>
      src + 'if (module.hot) { module.hot.accept(); }';

    const parentOptions = {
      rules: Array.isArray(options.test)
        ? options.test.map(test => createRule(test, modify))
        : [createRule(options.test, modify)],
      debug: options.debug
    };

    super(parentOptions);
  }
}
