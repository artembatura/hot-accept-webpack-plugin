import { ModifyModuleSourcePlugin } from 'modify-source-webpack-plugin';

export type Options = {
  test: string | RegExp | (string | RegExp)[];
};

export class HotAcceptPlugin extends ModifyModuleSourcePlugin {
  constructor({ test }: Options) {
    super(
      [].concat(test as never[]).map(test => ({
        test:
          typeof test === 'string'
            ? (module: any) => module.userRequest.endsWith(test)
            : test,
        modify: (src: string) =>
          src + 'if (module.hot) { module.hot.accept(); }',
        findFirst: true
      }))
    );
  }
}
