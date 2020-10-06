import { create } from './create';

(async () => {
  const packagePath = `${process.cwd()}/fixtures/functions_methods/package`;
  console.log(packagePath);

  await create(packagePath);
})();
