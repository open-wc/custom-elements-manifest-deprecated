import { create } from './create';

(async () => {
  const packagePath = `${process.cwd()}/fixtures/types_propertylike/package`;
  console.log(packagePath);

  await create(packagePath);
})();
