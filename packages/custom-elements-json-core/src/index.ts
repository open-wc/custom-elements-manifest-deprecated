import { create } from './create';

(async () => {
  const packagePath = `${process.cwd()}/fixtures/inheritance_superclass_properties/package`;
  console.log(packagePath);

  await create(packagePath);
})();
