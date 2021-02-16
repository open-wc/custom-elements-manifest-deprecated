import path from 'path';
import fs from 'fs';
import ts from 'typescript';

import {
  Package,
  Declaration,
  JavaScriptModule,
  CustomElement,
  Attribute,
  ClassMember,
  Event,
} from 'custom-elements-manifest/schema';
import { ExportType, isValidArray, pushSafe } from './utils';
import { Import, isBareModuleSpecifier } from './utils';
import { customElementsJson } from './customElementsJson';

import { handleClass } from './ast/handleClass';
import { handleCustomElementsDefine } from './ast/handleCustomElementsDefine';
import { handleExport } from './ast/handleExport';
import { handleImport } from './ast/handleImport';
import { getMixin } from './ast/getMixin';
import { Plugin } from './index';


interface Options {
  path?: string,
  sourceCode?: string,
  modulePaths?: string[],
  tsTarget?: number,
  plugins?: Plugin[]
}

/**
 * `opts.modulePaths` can be provided to analyze globs from the filesystem
 * @example
 * ```
 * create({modulePaths:[globs]});
 * ```
 * 
 * `opts.path` and `opts.sourceCode` can be provided to 'manually' pass some code to analyze
 * this is useful for example the playground, but also calling the analyzer programmatically
 * 
 * @example
 * ```
 * create({path:'./my-el', sourceCode: 'export class MyEl extends HTMLElement { foo = 1 }'});
 * ```
 * 
 * `opts.tsTarget` sets the ts target. Default is ES2015. Possible values are:
 *   ES3 = 0,
 *   ES5 = 1,
 *   ES2015 = 2,
 *   ES2016 = 3,
 *   ES2017 = 4,
 *   ES2018 = 5,
 *   ES2019 = 6,
 *   ES2020 = 7,
 *   ESNext = 99,
 *   JSON = 100,
 *   Latest = 99
 */
export async function create(opts: Options = {}): Promise<Package> {
  customElementsJson.reset();
  
  const runSingle = opts.path && opts.sourceCode;
  const modules: any = runSingle ? [opts.path] : [...(opts.modulePaths || [])];
  modules!.forEach((modulePath: string) => {
    let relativeModulePath = '';
    let tsOptions = {
      module: '',
      source: ''
    }
    
    if(opts.path && opts.sourceCode) {
      /* Analyze code passed down in options as string */
      relativeModulePath = opts.path;
      tsOptions = {
        module: opts.path,
        source: opts.sourceCode,
      }
    } 
    
    if(opts.modulePaths) {
      /* Analyze code inside a project, gathered from the filesystem */
      relativeModulePath = `./${path.relative(process.cwd(), modulePath)}`;
      tsOptions = {
        module: modulePath,
        source: fs.readFileSync(modulePath).toString(),
      }
    }

    if(
      !opts.path &&
      !opts.sourceCode &&
      !opts.modulePaths
    ) {
      throw new Error('Nothing to analyze. Supply a `path`, `sourceCode`, or `modulePaths`.');
    }

    customElementsJson.modules.push({
      kind: 'javascript-module',
      path: relativeModulePath,
      declarations: [],
      exports: [],
    });

    const sourceFile = ts.createSourceFile(
      tsOptions.module,
      tsOptions.source,
      opts.tsTarget || ts.ScriptTarget.ES2015,
      true,
    );

    customElementsJson.setCurrentModule(sourceFile);

    /**
     * ANALYZE PHASE
     * Go through the AST of every separate module, and gather as much as information as we can
     * This includes a modules imports, which are not specified in custom-elements.json, but are
     * required for the LINK PHASE, and deleted when processed
     */
    const currModule = customElementsJson.modules.find(
      _module => _module.path === relativeModulePath,
    ) as JavaScriptModule;
    visit(sourceFile, currModule, opts.plugins);

    /**
     * LINK PHASE
     * All information for a module has been gathered, now we can link information together. Like:
     * - Finding a CustomElement's tagname by finding its customElements.define() call (or 'export')
     * - Applying inheritance to classes (adding `inheritedFrom` properties/attrs/events/methods)
     * -
     */

    // Match mixins with their imports
    const classes = currModule.declarations.filter(declaration => declaration.kind === 'class');

    classes.forEach((customElement: any) => {
      customElement.mixins &&
        customElement.mixins.forEach((mixin: any) => {
          const foundMixin = [
            ...(currModule.declarations || []),
            ...(customElementsJson.imports || []),
          ].find((_import: Import) => _import.name === mixin.name);

          if (foundMixin) {
            /**
             * Find a mixin's nested/inner mixins and add them to the class's list of mixins
             * @example const MyMixin1 = klass => class MyMixin1 extends MyMixin2(klass) {}
             */
            if (Array.isArray(foundMixin.mixins) && foundMixin.mixins.length > 0) {
              foundMixin.mixins.forEach((mixin: any) => {
                const nestedFoundMixin = [
                  ...(currModule.declarations || []),
                  ...(customElementsJson.imports || []),
                ].find((_import: Import) => _import.name === mixin.name);

                // Mixin is imported from a third party module (bare module specifier)
                if (nestedFoundMixin.importPath && nestedFoundMixin.isBareModuleSpecifier) {
                  mixin.package = nestedFoundMixin.importPath;
                }

                // Mixin is imported from a different local module
                if (nestedFoundMixin.importPath && !nestedFoundMixin.isBareModuleSpecifier) {
                  mixin.module = path.resolve(path.dirname(currModule.path), nestedFoundMixin.importPath).replace(process.cwd(), '');
                }

                // Mixin was found in the current modules declarations, so defined locally
                if (!nestedFoundMixin.importPath) {
                  mixin.module = currModule.path;
                }

                customElement.mixins.push(mixin);
              });
            }
            // Mixin is imported from bare module specifier
            if (foundMixin.importPath && foundMixin.isBareModuleSpecifier) {
              mixin.package = foundMixin.importPath;
            }

            // Mixin is imported from a different local module
            if (foundMixin.importPath && !foundMixin.isBareModuleSpecifier) {
              mixin.module = path.resolve(path.dirname(currModule.path), foundMixin.importPath).replace(process.cwd(), '');
            }

            // Mixin was found in the current modules declarations, so defined locally
            if (!foundMixin.importPath) {
              mixin.module = currModule.path;
            }
          }
        });
    });

    // Find any mixins that were used in a class, so we can add them to a modules declarations
    const usedMixins: any = [];
    currModule.declarations.forEach((declaration: any) => {
      if (declaration.kind === 'mixin') {
        // if its a mixin, find out if a class is making use of it
        const isUsed = currModule.declarations.find(nestedDeclaration => {
          if (
            nestedDeclaration.kind === 'class' &&
            isValidArray(nestedDeclaration.mixins)
          ) {
            return (
              nestedDeclaration.mixins!.find(mixin => mixin.name === declaration.name) !== undefined
            );
          }
        });
        if (isUsed) {
          usedMixins.push(declaration);
        }
      }
    });

    // remove any declarations that are not exported
    currModule.declarations = currModule.declarations.filter(declaration => {
      return (
        currModule.exports &&
        currModule.exports.some(_export => {
          return declaration.name === _export.name || declaration.name === _export.declaration.name;
        })
      );
    });

    currModule.declarations = [...(currModule.declarations || []), ...(usedMixins || [])];

    opts.plugins?.forEach(({moduleLinkPhase}) => {
      if(moduleLinkPhase) moduleLinkPhase({moduleDoc: currModule});
    });
  });

  /** POST-PROCESSING, e.g.: linking class to definitions etc */
  const classes = customElementsJson.getClasses();
  const definitions = customElementsJson.getDefinitions(); // CustomElementExports

  // Match modulePath for definition declarations
  for (const definition of definitions) {
    for (const _module of customElementsJson.modules) {
      const modulePath = _module.path;
      const match = [...(<Declaration[]>_module.declarations)].some(
        classDoc => {
          return classDoc.name === definition.declaration.name;
        },
      );

      if (match) {
        definition.declaration.module = modulePath;
        break;
      }
    }
  }

  // Match tagNames for classDocs, and inheritance chain
  classes.forEach((customElement: CustomElement) => {
    const tagName = definitions.find(
      def => def && def.declaration && def.declaration.name === customElement.name,
    )?.name;
    if (tagName && !customElement.tagName) {
      customElement.tagName = tagName;
    }

    // getInheritance chain
    const inheritanceChain = customElementsJson.getInheritanceTree(customElement.name);

    inheritanceChain.forEach((klass: any) => {
      // Handle mixins
      if (klass?.kind !== 'class') {
        if (klass?.package) {
          // the mixin comes from a bare module specifier, skip it
          return;
        }

        if (klass?.module) {
          const klassModule = customElementsJson.modules.find(
            (_module: any) => _module.path === klass.module,
          );
          if (klassModule) {
            const foundMixin: any = klassModule.declarations.find(
              (declaration: any) => declaration.kind === 'mixin' && declaration.name === klass.name,
            );
            foundMixin.members &&
              foundMixin.members.forEach((member: any) => {
                const newMember = {
                  ...member,
                  inheritedFrom: {
                    name: klass.name,
                    module: klass.module,
                  },
                };

                if (isValidArray(customElement.members)) {
                  customElement.members = pushSafe(customElement.members, newMember);
                }
              });
          }
        }
      }

      // ignore the current class itself
      if (klass?.name === customElement.name) {
        return;
      }

      ['attributes', 'members', 'events'].forEach(type => {
        klass && klass[type] &&
          klass[type].forEach((currItem: Attribute | Event | ClassMember) => {
            const moduleForKlass = customElementsJson.getModuleForClass(klass.name);
            const moduleForMixin = customElementsJson.getModuleForMixin(klass.name);

            const newItem = { ...currItem };

            /**
             * If an attr, member or is already present in the base class, but we encounter it here,
             * it means that the base has overridden that method from the super class, so we bail
             */
            const itemIsOverridden = (customElement as any)[type]?.some(
              (item: Attribute | Event | ClassMember) => newItem.name === item.name,
            );
            if (itemIsOverridden) {
              return;
            }

            if (moduleForKlass && isBareModuleSpecifier(moduleForKlass)) {
              newItem.inheritedFrom = {
                name: klass.name,
                package: moduleForKlass || moduleForMixin,
              };
            } else {
              newItem.inheritedFrom = {
                name: klass.name,
                module: moduleForKlass || moduleForMixin,
              };
            }
            (customElement as any)[type] = pushSafe((customElement as any)[type], newItem);
          });
      });
    });
  });

  delete customElementsJson.currentModule;

  opts.plugins?.forEach(({packageLinkPhase}) => {
    if(packageLinkPhase) packageLinkPhase(customElementsJson);
  });

  delete customElementsJson.imports;

  return customElementsJson;
}

function visit(source: ts.SourceFile, moduleDoc: JavaScriptModule, plugins: Plugin[] | undefined) {
  visitNode(source);

  function visitNode(node: ts.Node) {
    const mixin: any = getMixin(node as ts.VariableStatement | ts.FunctionDeclaration);
    const isMixin = mixin !== false;

    switch (node.kind) {
      case ts.SyntaxKind.ClassDeclaration:
        handleClass(node, moduleDoc, 'class');
        handleExport(node as ExportType, moduleDoc);
        break;
      case ts.SyntaxKind.PropertyAccessExpression:
        handleCustomElementsDefine(node, moduleDoc);
        break;
      case ts.SyntaxKind.VariableStatement:
      case ts.SyntaxKind.ExportDeclaration:
      case ts.SyntaxKind.FunctionDeclaration:
      case ts.SyntaxKind.ExportAssignment:
        if (isMixin) {
          handleClass(mixin.node, moduleDoc, 'mixin', mixin.classDoc);
          handleExport(node as ExportType, moduleDoc, mixin.node?.name?.text);
          break;
        }
        handleExport(node as ExportType, moduleDoc);
        break;
      case ts.SyntaxKind.ImportDeclaration:
        handleImport(node);
        break;
    }

    plugins?.forEach(({analyzePhase}) => {
      if(analyzePhase) analyzePhase({node, moduleDoc});
    });

    ts.forEachChild(node, visitNode);
  }
}
