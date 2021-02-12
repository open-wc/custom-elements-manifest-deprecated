#!/usr/bin/env node

import { create } from './create';
import commandLineArgs from 'command-line-args';
import fs from 'fs';

const alwaysIgnore = ['!node_modules/**/*.*', '!bower_components/**/*.*', '!**/*.test.{js,ts}', '!**/*.suite.{js,ts}', '!**/*.config.{js,ts}'];
  
const mainDefinitions = [
  { name: 'command', defaultOption: true }
]
const mainOptions = commandLineArgs(mainDefinitions, { stopAtFirstUnknown: true });
const argv = mainOptions._unknown || [];

(async () => {

  if (mainOptions.command === 'analyze') {
    const optionDefinitions = [
      { name: 'glob', type: String, multiple: true, defaultValue: [ '**/*.{js,ts}', '!**/.*.{js,ts}'] },
      { name: 'exclude', type: String, multiple: true },
      { name: 'dev', type: Boolean, defaultValue: false },
    ];
    
    const options = commandLineArgs(optionDefinitions, { argv });
    
    const merged = [
      ...options.glob,
      ...options.exclude || [],
      ...alwaysIgnore,
    ];

    await create(merged, options.dev);
    try {
      const packageJsonPath = `${process.cwd()}/package.json`;
      const packageJson = require(packageJsonPath);
      packageJson.customElementsManifest = 'custom-elements.json';
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    } catch {
      console.log(`Could not add 'customElementsManifest' property to ${process.cwd()}/package.json. \nAdding this property helps tooling locate your Custom Elements Manifest. Please consider adding it yourself, or file an issue if you think this is a bug.\nhttps://www.github.com/open-wc/custom-elements-manifest`);
    }
  } else {
    console.log(`
@custom-elements-manifest/analyzer

Available commands:
    analyze     |          | Analyze files
    --glob      | string[] | Globs to analyze
    --exclude   | string[] | Globs to exclude

Example:
    custom-elements-manifest analyze --glob "**/*.js" --exclude "foo.js" "bar.js"
`)
  }

})();
