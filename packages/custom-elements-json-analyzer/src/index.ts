#!/usr/bin/env node

import { create } from './create';
import commandLineArgs from 'command-line-args';

const optionDefinitions = [
  { name: 'glob', type: String, multiple: true, defaultOption: true, defaultValue: [ '**/*.{js,ts}', '!**/.*.{js,ts}', '!**/*.config.{js,ts}' ] },
  { name: 'exclude', type: String, multiple: true },
];

const options = commandLineArgs(optionDefinitions);

(async () => {
  console.log(options);
  await create(options);
})();
