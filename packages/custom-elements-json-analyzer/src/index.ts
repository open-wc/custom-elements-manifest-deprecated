#!/usr/bin/env node

import { create } from './create';
import commandLineArgs from 'command-line-args';

const optionDefinitions = [
  { name: 'glob', type: String, multiple: true, defaultOption: true, defaultValue: [ '**/*.js', '**/*.ts', '!**/.*.js', '!**/.*.ts', '!**/*.config.js', '!**/*.config.ts' ] },
  { name: 'exclude', type: String, multiple: true },
];

const options = commandLineArgs(optionDefinitions);

(async () => {
  const packagePath = `${process.cwd()}/fixtures/functions_methods/package`;
  console.log(packagePath);

  await create(packagePath);
})();
