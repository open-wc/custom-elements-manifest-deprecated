import path from 'path';
import fs from 'fs';
import globby from 'globby';
import ts from 'typescript';
import { isValidArray, pushSafe } from './utils';
import { isBareModuleSpecifier } from './utils';

import { customElementsJson } from './customElementsJson';

import { handleClass } from './ast/handleClass';
import { handleCustomElementsDefine } from './ast/handleCustomElementsDefine';
import { handleExport } from './ast/handleExport';
import { handleImport } from './ast/handleImport';
import { getMixin } from './ast/getMixin';

export async function create(packagePath) {
  const modulePaths = await globby([`${packagePath}/**/*.js`, `!${packagePath}/**/.*.js`, `!${packagePath}/**/*.config.js`]);

  modulePaths.forEach(modulePath => {
    const relativeModulePath = `./${path.relative(packagePath, modulePath)}`;

    customElementsJson.modules.push({
      kind: 'javascript-module',
      path: relativeModulePath,
      declarations: [],
      exports: [],
    });

    const sourceFile = ts.createSourceFile(
      modulePath,
      fs.readFileSync(modulePath).toString(),
      ts.ScriptTarget.ES2015,
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
    );
    visit(sourceFile, currModule);

    /**
     * LINK PHASE
     * All information for a module has been gathered, now we can link information together. Like:
     * - Finding a CustomElement's tagname by finding its customElements.define() call (or 'export')
     * - Applying inheritance to classes (adding `inheritedFrom` properties/attrs/events/methods)
     * -
     */

    // Match mixins with their imports
    const classes = currModule.declarations.filter(declaration => declaration.kind === 'class');

    classes.forEach((customElement) => {
      if (customElement.superclass && customElement.superclass.name !== 'HTMLElement') {
        const foundSuperclass = [...(classes || []), ...(customElementsJson.imports || [])].find(
          (_import) => {
            return _import.name === customElement.superclass.name;
          },
        );

        if (foundSuperclass) {
          // Superclass is imported, but from a bare module specifier
          if (foundSuperclass.kind && foundSuperclass.isBareModuleSpecifier) {
            customElement.superclass.package = foundSuperclass.importPath;
          }

          // Superclass is imported, but from a different local module
          if (foundSuperclass.kind && !foundSuperclass.isBareModuleSpecifier) {
            customElement.superclass.module = foundSuperclass.importPath;
          }

          // Superclass declared in local module
          if (foundSuperclass.isBareModuleSpecifier === undefined) {
            customElement.superclass.module = currModule.path;
          }
        }
      }

      customElement.mixins &&
        customElement.mixins.forEach((mixin) => {
          const foundMixin = [
            ...(currModule.declarations || []),
            ...(customElementsJson.imports || []),
          ].find((_import) => _import.name === mixin.name);

          if (foundMixin) {
            /**
             * Find a mixin's nested/inner mixins and add them to the class's list of mixins
             * @example const MyMixin1 = klass => class MyMixin1 extends MyMixin2(klass) {}
             */
            if (Array.isArray(foundMixin.mixins) && foundMixin.mixins.length > 0) {
              foundMixin.mixins.forEach((mixin) => {
                const nestedFoundMixin = [
                  ...(currModule.declarations || []),
                  ...(customElementsJson.imports || []),
                ].find((_import) => _import.name === mixin.name);

                // Mixin is imported from a third party module (bare module specifier)
                if (nestedFoundMixin.importPath && nestedFoundMixin.isBareModuleSpecifier) {
                  mixin.package = nestedFoundMixin.importPath;
                }

                // Mixin is imported from a different local module
                if (nestedFoundMixin.importPath && !nestedFoundMixin.isBareModuleSpecifier) {
                  mixin.module = nestedFoundMixin.importPath;
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
              mixin.module = foundMixin.importPath;
            }

            // Mixin was found in the current modules declarations, so defined locally
            if (!foundMixin.importPath) {
              mixin.module = currModule.path;
            }
          }
        });
    });

    // Find any mixins that were used in a class, so we can add them to a modules declarations
    const usedMixins = [];
    currModule.declarations.forEach((declaration) => {
      if (declaration.kind === 'mixin') {
        // if its a mixin, find out if a class is making use of it
        const isUsed = currModule.declarations.find(nestedDeclaration => {
          if (
            nestedDeclaration.kind === 'class' &&
            isValidArray(nestedDeclaration.mixins)
          ) {
            return (
              nestedDeclaration.mixins.find(mixin => mixin.name === declaration.name) !== undefined
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
  });

  /** POST-PROCESSING, e.g.: linking class to definitions etc */
  const classes = customElementsJson.getClasses();
  const definitions = customElementsJson.getDefinitions(); // CustomElementExports

  // Match modulePath for definition declarations
  for (const definition of definitions) {
    for (const _module of customElementsJson.modules) {
      const modulePath = _module.path;
      // @TODO: I dont think you need to go through the exports here
      const match = [...(_module.declarations), ...(_module.exports)].some(
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
  classes.forEach((customElement) => {
    const tagName = definitions.find(
      def => def && def.declaration && def.declaration.name === customElement.name,
    )?.name;
    if (tagName) {
      customElement.tagName = tagName;
    }

    // getInheritance chain
    const inheritanceChain = customElementsJson.getInheritanceTree(customElement.name);

    inheritanceChain.forEach((klass) => {
      // Handle mixins
      if (klass.kind !== 'class') {
        if (klass.package) {
          // the mixin comes from a bare module specifier, skip it
          return;
        }

        if (klass.module) {
          // @TODO add attrs/members/events
          const klassModule = customElementsJson.modules.find(
            (_module) => _module.path === klass.module,
          );
          if (klassModule) {
            const foundMixin = klassModule.declarations.find(
              (declaration) => declaration.kind === 'mixin' && declaration.name === klass.name,
            );
            foundMixin.members &&
              foundMixin.members.forEach((member) => {
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
      if (klass.name === customElement.name) {
        return;
      }

      ['attributes', 'members', 'events'].forEach(type => {
        klass[type] &&
          klass[type].forEach((currItem) => {
            const moduleForKlass = customElementsJson.getModuleForClass(klass.name);
            const moduleForMixin = customElementsJson.getModuleForMixin(klass.name);

            const newItem = { ...currItem };

            /**
             * If an attr, member or is already present in the base class, but we encounter it here,
             * it means that the base has overridden that method from the super class, so we bail
             */
            const itemIsOverridden = (customElement)[type]?.some(
              (item) => newItem.name === item.name,
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
            (customElement)[type] = pushSafe((customElement)[type], newItem);
          });
      });
    });
  });

  delete customElementsJson.imports;
  delete customElementsJson.currentModule;

  console.log(JSON.stringify(customElementsJson, null, 2));
  return customElementsJson;
}

function visit(source, moduleDoc) {
  visitNode(source);

  function visitNode(node) {
    const mixin = getMixin(node);
    const isMixin = mixin !== false;

    switch (node.kind) {
      case ts.SyntaxKind.ClassDeclaration:
        handleClass(node, moduleDoc, 'class');
        handleExport(node, moduleDoc);
        break;
      case ts.SyntaxKind.PropertyAccessExpression:
        handleCustomElementsDefine(node, moduleDoc);
        break;
      case ts.SyntaxKind.VariableStatement:
      case ts.SyntaxKind.ExportDeclaration:
      case ts.SyntaxKind.FunctionDeclaration:
      case ts.SyntaxKind.ExportAssignment:
        if (isMixin) {
          handleClass(mixin, moduleDoc, 'mixin');
          handleExport(node, moduleDoc, mixin.name.text);
          break;
        }
        handleExport(node, moduleDoc);
        break;
      case ts.SyntaxKind.ImportDeclaration:
        handleImport(node);
        break;
    }

    ts.forEachChild(node, visitNode);
  }
}
