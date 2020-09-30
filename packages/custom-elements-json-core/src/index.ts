import { create } from './create';

(async () => {
  const packagePath = `${process.cwd()}/fixtures/exports/package`;
  console.log(packagePath);

  await create(packagePath);
})();