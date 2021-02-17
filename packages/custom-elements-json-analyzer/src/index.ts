#!/usr/bin/env node

import { create } from './create';
import commandLineArgs from 'command-line-args';
import fs from 'fs';
import ts from 'typescript';
import globby from 'globby';
import { readConfig, ConfigLoaderError } from '@web/config-loader';
import { Module, Package } from 'custom-elements-manifest/schema';

interface userConfigOptions {
  /* Array of glob strings */
  globs: string[],
  exclude: string[],
  dev: boolean,
  tsTarget: number,

  /* Use if you want to analyze a string of code, for example for the playground API. Both are required in this case */
  path: string,
  sourceCode: string,

  plugins: Array<() => Plugin>
}

interface AnalyzeArgs {
  node: ts.Node,
  moduleDoc: Module
}

interface ModuleLinkArgs {
  moduleDoc: Module
}

export interface Plugin {
  analyzePhase?: (args: AnalyzeArgs) => void;
  moduleLinkPhase?: (args: ModuleLinkArgs) => void;
  packageLinkPhase?: (customElementsManifest: Package) => void;
}

const alwaysIgnore = ['!node_modules/**/*.*', '!bower_components/**/*.*', '!**/*.test.{js,ts}', '!**/*.suite.{js,ts}', '!**/*.config.{js,ts}'];
  
const mainDefinitions = [
  { name: 'command', defaultOption: true }
]
const mainOptions = commandLineArgs(mainDefinitions, { stopAtFirstUnknown: true });
const argv = mainOptions._unknown || [];

(async () => {

  if (mainOptions.command === 'analyze') {
    /**
     * Handle command line options
     */
    const optionDefinitions = [
      { name: 'globs', type: String, multiple: true, defaultValue: [ '**/*.{js,ts}', '!**/.*.{js,ts}'] },
      { name: 'exclude', type: String, multiple: true },
      { name: 'dev', type: Boolean, defaultValue: false },
      { name: 'litelement', type: Boolean, defaultValue: false },
      { name: 'stencil', type: Boolean, defaultValue: false },
    ];
    
    const commandLineOptions = commandLineArgs(optionDefinitions, { argv });
    
    let userConfig: userConfigOptions;
    try {
      userConfig = await readConfig('custom-elements-manifest.config');
    } catch (error) {
      if (error instanceof ConfigLoaderError) {
        console.error(error.message);
        return;
      }
      console.error(error);
      return;
    }

    const merged = [
      ...(commandLineOptions?.globs || []),
      ...(commandLineOptions?.exclude?.map((i: string) => `!${i}`) || []),
      ...(userConfig?.globs || []),
      ...(userConfig?.exclude?.map((i: string) => `!${i}`) || []),
      ...alwaysIgnore,
    ];

    const mergedOptions: any = {
      ...commandLineOptions,
      ...userConfig,
      modulePaths: undefined
    }

    if(mergedOptions?.globs) {
      mergedOptions.modulePaths = await globby(merged);
    }

    if(mergedOptions?.litelement) {
      const litPlugin = require('../plugins/lit.js');
      mergedOptions.plugins = [...(mergedOptions?.plugins || []), litPlugin()]
    }

    if(mergedOptions?.stencil) {
      const stencilPlugin = require('../plugins/stencil.js');
      mergedOptions.plugins = [...(mergedOptions?.plugins || []), stencilPlugin()]
    }

    const cem = await create(mergedOptions);

    fs.writeFileSync(`${process.cwd()}/custom-elements.json`, `${JSON.stringify(cem, null, 2)}\n`);
    if(mergedOptions?.dev) {
      console.log(JSON.stringify(cem, null, 2));
    }

    try {
      const packageJsonPath = `${process.cwd()}/package.json`;
      const packageJson = require(packageJsonPath);
      if(packageJson?.customElementsManifest) {
        return;
      } else {
        packageJson.customElementsManifest = 'custom-elements.json';
        fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
      }
    } catch {
      console.log(`Could not add 'customElementsManifest' property to ${process.cwd()}/package.json. \nAdding this property helps tooling locate your Custom Elements Manifest. Please consider adding it yourself, or file an issue if you think this is a bug.\nhttps://www.github.com/open-wc/custom-elements-manifest`);
    }
  } else {
    console.log(`
@custom-elements-manifest/analyzer

Available commands:
    | Command/option   | Type       | Description                                          | Example                 |
    | ---------------- | ---------- | ---------------------------------------------------- | ----------------------- |
    | analyze          |            | Analyze your components                              |                         |
    | --globs          | string[]   | Globs to analyze                                     | \`--globs "foo.js"\`    |
    | --exclude        | string[]   | Globs to exclude                                     | \`--exclude "!foo.js"\` |
    | --litelement     | boolean    | Enable special handling for LitElement syntax        | \`--litelement\`        |
    | --stencil        | boolean    | Enable special handling for Stencil syntax           | \`--stencil\`           |

Example:
    custom-elements-manifest analyze --litelement --globs "**/*.js" --exclude "foo.js" "bar.js"
`)
  }

})();
