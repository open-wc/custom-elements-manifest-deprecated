import { create } from './create';

(async () => {
  const packagePath = `${process.cwd()}/fixtures/slots/package`;
  console.log(packagePath);
  await create(packagePath);
})();