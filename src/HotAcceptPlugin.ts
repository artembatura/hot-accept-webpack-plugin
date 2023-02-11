import {
  ModifySourcePlugin,
  Rule,
  ConcatOperation,
  AbstractOperation
} from 'modify-source-webpack-plugin';
import type { NormalModule } from 'webpack';

export type Options = {
  test: string | RegExp | (string | RegExp)[];
  debug?: boolean;
};

function createRule(
  test: string | RegExp,
  operations: AbstractOperation[]
): Rule {
  if (typeof test === 'string') {
    const testString = test.replace(/\\/g, '/');

    const testFn = (module: NormalModule) => {
      const moduleRequest = module.userRequest?.replace(/\\/g, '/');

      return moduleRequest ? moduleRequest.endsWith(testString) : false;
    };

    return {
      test: testFn,
      operations
    };
  }

  return {
    test,
    operations
  };
}

export class HotAcceptPlugin extends ModifySourcePlugin {
  constructor(options: Options) {
    const operations = [
      new ConcatOperation('end', 'if (module.hot) { module.hot.accept(); }')
    ];

    const rules = Array.isArray(options.test)
      ? options.test.map(test => createRule(test, operations))
      : [createRule(options.test, operations)];

    super({
      rules,
      debug: options.debug
    });
  }
}
