import { create } from './create';

(async () => {
  const packagePath = `${process.cwd()}/fixtures/jsdoc_prop/package`;
  console.log(packagePath);

  await create(packagePath);
})();