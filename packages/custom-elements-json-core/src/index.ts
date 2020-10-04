import { create } from './create';

(async () => {
  const packagePath = `${process.cwd()}/fixtures/default_exports/package`;
  console.log(packagePath);

  await create(packagePath);
})();