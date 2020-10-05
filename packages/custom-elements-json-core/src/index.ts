import { create } from './create';

(async () => {
  const packagePath = `${process.cwd()}/fixtures/jsdoc_var/package`;
  console.log(packagePath);

  await create(packagePath);
})();
