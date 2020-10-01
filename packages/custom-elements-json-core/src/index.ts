import { create } from './create';

(async () => {
  const packagePath = `${process.cwd()}/fixtures/mixins/package`;
  console.log(packagePath);

  await create(packagePath);
})();