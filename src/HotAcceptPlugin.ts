import { ModifySourcePlugin, Rule } from 'modify-source-webpack-plugin';
import { NormalModule } from 'webpack';

export type Options = {
  test: string | RegExp | (string | RegExp)[];
  debug?: boolean;
};

function createRule(test: string | RegExp, modify: Rule['modify']): Rule {
  if (typeof test === 'string') {
    const testFn = (module: NormalModule) => {
      const moduleRequest = module.userRequest?.replace(/\\/g, '/');

      return moduleRequest ? moduleRequest.endsWith(test) : false;
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
