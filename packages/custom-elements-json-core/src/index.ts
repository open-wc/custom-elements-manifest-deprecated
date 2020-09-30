import { create } from './create';

(async () => {
  const packagePath = `${process.cwd()}/fixtures/project-like/package`;
  console.log(packagePath);

  await create(packagePath);
})();