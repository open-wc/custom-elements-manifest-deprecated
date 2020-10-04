import path from 'path';
import fs from 'fs';
import globby from 'globby';
import ts from 'typescript';
import {
  Package,
  Declaration,
  ClassDeclaration,
  JavaScriptModule,
  CustomElement,
  Export,
  Attribute,
  ClassMember,
  Event,
} from 'custom-elements-json/schema';
import { ExportType, isImport } from './utils';
import { Import, isBareModuleSpecifier } from './utils';

import { customElementsJson } from './customElementsJson';

import { handleClass } from './ast/handleClass';
import { handleCustomElementsDefine } from './ast/handleCustomElementsDefine';
import { handleExport } from './ast/handleExport';
import { handleImport } from './ast/handleImport';
import { getMixin } from './ast/getMixin';

export async function create(packagePath: string): Promise<Package> {
  const modulePaths = await globby([`${packagePath}/**/*.js`]);

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
    ) as JavaScriptModule;
    visit(sourceFile, currModule);

    /**
     * LINK PHASE
     * All information for a module has been gathered, now we can link information together. Like:
     * - Finding a CustomElement's tagname by finding its customElements.define() call (or 'export')
     * - Applying inheritance to classes (adding `inheritedFrom` properties/attrs/events/methods)
     * -
     */

    // Match mixins with their imports
    const classes = currModule.declarations.filter(
      (declaration): declaration is ClassDeclaration => declaration.kind === 'class',
    );

    classes.forEach(customElement => {
      if (customElement.superclass && customElement.superclass.name !== 'HTMLElement') {
        const classesAndImports = [...(classes || []), ...(customElementsJson.imports || [])];
        const foundSuperclass = classesAndImports.find(_import => {
          const superclassName = customElement?.superclass?.name;
          return superclassName && _import.name === superclassName;
        });

        if (foundSuperclass) {
          if (isImport(foundSuperclass)) {
            if (foundSuperclass.isBareModuleSpecifier) {
              // Superclass is imported, but from a bare module specifier
              customElement.superclass.package = foundSuperclass.importPath;
            } else {
              // Superclass is imported, but from a different local module
              customElement.superclass.module = foundSuperclass.importPath;
            }
          } else {
            // Superclass declared in local module
            customElement.superclass.module = currModule.path;
          }
        }
      }
      customElement.mixins?.forEach(mixin => {
        const foundMixin = [
          ...(currModule.declarations || []),
          ...(customElementsJson.imports || []),
        ].find(_import => _import.name === mixin.name);

        if (foundMixin) {
          /**
           * Find a mixin's nested/inner mixins and add them to the class's list of mixins
           * @example const MyMixin1 = klass => class MyMixin1 extends MyMixin2(klass) {}
           */
          if ('mixins' in foundMixin) {
            foundMixin.mixins?.forEach((mixin: any) => {
              const nestedFoundMixin = [
                ...(currModule.declarations || []),
                ...(customElementsJson.imports || []),
              ].find(_import => _import.name === mixin.name);

              if (isImport(nestedFoundMixin)) {
                if (nestedFoundMixin.importPath) {
                  if (nestedFoundMixin.isBareModuleSpecifier) {
                    // Mixin is imported from a third party module (bare module specifier)
                    mixin.package = nestedFoundMixin.importPath;
                  } else {
                    // Mixin is imported from a different local module
                    mixin.module = nestedFoundMixin.importPath;
                  }
                } else {
                  // Mixin was found in the current modules declarations, so defined locally
                  mixin.module = currModule.path;
                }
              }
              customElement.mixins = [...(customElement.mixins || []), mixin];
            });
          }
          if (isImport(foundMixin)) {
            // Mixin is imported from bare module specifier
            if (foundMixin.isBareModuleSpecifier) {
              mixin.package = foundMixin.importPath;
            } else {
              // Mixin is imported from a different local module
              mixin.module = foundMixin.importPath;
            }
          }
        } else {
          // Mixin was found in the current modules declarations, so defined locally
          mixin.module = currModule.path;
        }
      });
    });

    // Find any mixins that were used in a class, so we can add them to a modules declarations
    const usedMixins: Declaration[] = [];
    currModule.declarations.forEach(declaration => {
      if (declaration.kind === 'mixin') {
        // if its a mixin, find out if a class is making use of it
        const isUsed = currModule.declarations.find(nestedDeclaration => {
          if (
            nestedDeclaration.kind === 'class' &&
            Array.isArray(nestedDeclaration.mixins) &&
            nestedDeclaration.mixins.length > 0
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
  // @TODO: Find the module path for a superclass
  const classes = customElementsJson.getClasses();
  const definitions = customElementsJson.getDefinitions(); // CustomElementExports

  // Match modulePath for definition declarations
  for (const definition of definitions) {
    for (const _module of customElementsJson.modules) {
      const modulePath = _module.path;
      // @TODO: I dont think you need to go through the exports here
      const match = [...(<Declaration[]>_module.declarations), ...(<Export[]>_module.exports)].some(
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
    if (tagName) {
      customElement.tagName = tagName;
    }

    // getInheritance chain
    const inheritanceChain = customElementsJson.getInheritanceTree(customElement.name);

    inheritanceChain.forEach((klass: any) => {
      // Handle mixins
      if (klass.kind !== 'class') {
        if (klass.package) {
          // the mixin comes from a bare module specifier, skip it
          return;
        }

        if (klass.module) {
          // @TODO add attrs/members/events
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

                if (Array.isArray(customElement.members) && customElement.members.length > 0) {
                  customElement.members.push(newMember);
                } else {
                  customElement.members = [newMember];
                }
              });
          }
        }
      }

      // ignore the current class itself
      if (klass.name === customElement.name) {
        return;
      }
      // loop through attrs, events, members, add inherited from field, push to og class
      klass.attributes && klass.attributes.forEach((attr: Attribute) => {});
      klass.events && klass.events.forEach((event: Event) => {});

      klass.members &&
        klass.members.forEach((member: ClassMember) => {
          const moduleForKlass = customElementsJson.getModuleForClass(klass.name);
          let newMember;

          if (moduleForKlass && isBareModuleSpecifier(moduleForKlass)) {
            newMember = {
              ...member,
              inheritedFrom: {
                name: klass.name,
                package: moduleForKlass,
              },
            };
          } else {
            newMember = {
              ...member,
              inheritedFrom: {
                name: klass.name,
                module: moduleForKlass,
              },
            };
          }

          if (Array.isArray(customElement.members) && customElement.members.length > 0) {
            customElement.members.push(newMember);
          } else {
            customElement.members = [newMember];
          }
        });
    });
  });

  delete customElementsJson.imports;
  delete customElementsJson.currentModule;

  console.log(JSON.stringify(customElementsJson, null, 2));
  return customElementsJson;
}

function visit(source: ts.SourceFile, moduleDoc: JavaScriptModule) {
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
          handleClass(mixin, moduleDoc, 'mixin');
          handleExport(node as ExportType, moduleDoc, mixin.name.text);
          break;
        }
        handleExport(node as ExportType, moduleDoc);
        break;
      case ts.SyntaxKind.ImportDeclaration:
        handleImport(node);
        break;
    }

    ts.forEachChild(node, visitNode);
  }
}
