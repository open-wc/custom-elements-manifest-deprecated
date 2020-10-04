import { create } from './create';

(async () => {
  const packagePath = `${process.cwd()}/fixtures/-test/package`;
  console.log(packagePath);

  await create(packagePath);
})();