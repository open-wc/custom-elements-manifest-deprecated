import { create } from './create';

(async () => {
  const packagePath = `${process.cwd()}/fixtures/link_superclasses/package`;
  console.log(packagePath);

  await create(packagePath);
})();