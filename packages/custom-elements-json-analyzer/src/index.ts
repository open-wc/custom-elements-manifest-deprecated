#!/usr/bin/env node

import { create } from './create';
import commandLineArgs from 'command-line-args';
import fs from 'fs';

const optionDefinitions = [
  { name: 'glob', type: String, multiple: true, defaultOption: true, defaultValue: [ '**/*.{js,ts}', '!**/.*.{js,ts}', '!node_modules/**/*', '!**/*.test.{js,ts}', '!**/*.config.{js,ts}' ] },
  { name: 'exclude', type: String, multiple: true },
];

const options = commandLineArgs(optionDefinitions);

(async () => {
  await create(options);

  try {
    const packageJsonPath = `${process.cwd()}/package.json`;
    const packageJson = require(packageJsonPath);
    packageJson.customElementsManifest = 'custom-elements.json';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  } catch {
    console.log(`Could not add 'customElementsManifest' property to ${process.cwd()}/package.json. \nAdding this property helps tooling locate your Custom Elements Manifest. Please consider adding it yourself, or file an issue if you think this is a bug.\nhttps://www.github.com/open-wc/custom-elements-manifest`);
  }
})();
