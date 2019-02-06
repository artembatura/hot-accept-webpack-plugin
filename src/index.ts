import { ModifyModuleSourcePlugin } from 'modify-source-webpack-plugin';

export type Options = {
  test: RegExp | RegExp[];
};

export class HotAcceptPlugin extends ModifyModuleSourcePlugin {
  constructor({ test }: Options) {
    super(
      [].concat(test as never[]).map(test => ({
        test,
        modify: (src: string) =>
          src + 'if (module.hot) { module.hot.accept(); }',
        findFirst: true
      }))
    );
  }
}
