import { create } from './create';

(async () => {
  const packagePath = `${process.cwd()}/fixtures/-mixins2/package`;
  console.log(packagePath);

  await create(packagePath);
})();