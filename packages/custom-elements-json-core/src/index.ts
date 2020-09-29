import { create } from './create';

(async () => {
  const packagePath = `${process.cwd()}/fixtures/events/package`;
  console.log(packagePath);
  await create(packagePath);
})();