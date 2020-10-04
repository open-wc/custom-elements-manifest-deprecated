import { create } from './create';

(async () => {
  const packagePath = `${process.cwd()}/fixtures/getters_and_setters/package`;
  console.log(packagePath);

  await create(packagePath);
})();