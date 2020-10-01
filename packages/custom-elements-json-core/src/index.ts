import { create } from './create';

(async () => {
  const packagePath = `${process.cwd()}/fixtures/methods/package`;
  console.log(packagePath);

  await create(packagePath);
})();