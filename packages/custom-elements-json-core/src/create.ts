import path from 'path';
import fs from 'fs';
import globby from 'globby';
import ts from 'typescript';
import { Package, Declaration, JavaScriptModule, CustomElement, Export } from 'custom-elements-json/schema';
import { ExportType } from './ast/handleExport';
import { Import } from './ast/handleImport';

import { customElementsJson } from './customElementsJson';

import { handleClass } from './ast/handleClass';
import { handleCustomElementsDefine } from './ast/handleCustomElementsDefine';
import { handleExport } from './ast/handleExport';
import { handleImport } from './ast/handleImport';

export async function create(packagePath: string): Promise<Package> {
  const modulePaths = await globby([`${packagePath}/**/*.js`]);

  modulePaths.forEach(modulePath => {
    const relativeModulePath = `./${path.relative(packagePath, modulePath)}`;

    customElementsJson.modules.push({
      kind: 'javascript-module',
      path: relativeModulePath,
      declarations: [],
      exports: []
    });

    const sourceFile = ts.createSourceFile(
      modulePath,
      fs.readFileSync(modulePath).toString(),
      ts.ScriptTarget.ES2015,
      true
    );

    customElementsJson.setCurrentModule(sourceFile);

    /** SYNTAX PROCESSING */
    const currModule = (customElementsJson.modules.find(_module => _module.path === relativeModulePath) as JavaScriptModule);
    visit(sourceFile, currModule);

    // Match mixins with their imports
    const classes = currModule.declarations.filter(declaration => declaration.kind === 'class');

    classes.forEach((customElement: any) => {
      if(customElement.superclass && customElement.superclass.name !== 'HTMLElement') {
        const foundSuperclass = [...(classes || []), ...(customElementsJson.imports || [])].find((_import: Import) => {
          return _import.name === customElement.superclass.name;
        });

        if(foundSuperclass) {
          // Superclass is imported, but from a bare module specifier
          if(foundSuperclass.kind && foundSuperclass.isBaremoduleSpecifier) {
            customElement.superclass.package = foundSuperclass.importPath;
          }

          // Superclass is imported, but from a different local module
          if(foundSuperclass.kind && !foundSuperclass.isBaremoduleSpecifier) {
            customElement.superclass.module = foundSuperclass.importPath;
          }

          // Superclass declared in local module
          if(foundSuperclass.isBaremoduleSpecifier === undefined) {
            customElement.superclass.module = currModule.path;
          }
        }
      }

      customElement.mixins && customElement.mixins.forEach((mixin: any) => {
        const foundMixin = [...currModule.declarations, ...customElementsJson.imports].find((_import: Import) => _import.name === mixin.name);
        if(foundMixin) {
          // Mixin is imported from bare module specifier
          if(foundMixin.importPath && foundMixin.isBaremoduleSpecifier) {
            mixin.package = foundMixin.importPath;
          }

          // Mixin is imported from a different local module
          if(foundMixin.importPath && !foundMixin.isBaremoduleSpecifier) {
            mixin.module = foundMixin.importPath;
          }

          // Mixin was found in the current modules declarations, so defined locally
          if(!foundMixin.importPath) {
            mixin.module = currModule.path;
          }
        }
      });
    });

    // remove any declarations that are not exported
    currModule.declarations = currModule.declarations.filter(declaration => {
      return currModule.exports && currModule.exports.some(_export => {
        return declaration.name === _export.name || declaration.name === _export.declaration.name
      });
    });
  });

  /** POST-PROCESSING, e.g.: linking class to definitions etc */
  // @TODO: Find the module path for a superclass
  const classes = customElementsJson.getClasses();
  const definitions = customElementsJson.getDefinitions(); // CustomElementExports

  // Match modulePath for definition declarations
  for(const definition of definitions) {
    for(const _module of customElementsJson.modules) {
      const modulePath = _module.path;
      // @TODO: I dont think you need to go through the exports here
      const match = [...<Declaration[]>_module.declarations, ...<Export[]>_module.exports]
        .some(classDoc => {
          return classDoc.name === definition.declaration.name
        });

      if(match) {
        definition.declaration.module = modulePath;
        break;
      }
    }
  }

  // Match tagNames for classDocs
  classes.forEach((customElement: CustomElement) => {
    const tagName = definitions.find(def => def && def.declaration && def.declaration.name === customElement.name)?.name;
    if(tagName) {
      customElement.tagName = tagName;
    }
  });

  delete customElementsJson.imports;
  delete customElementsJson.currentModule;

  console.log(JSON.stringify(customElementsJson, null, 2));
  return customElementsJson;
}

function visit(source: ts.SourceFile, moduleDoc: JavaScriptModule) {
  visitNode(source);

  function visitNode(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.ClassDeclaration:
        handleClass(node, moduleDoc);
        handleExport((node as ExportType), moduleDoc);
        break;
      case ts.SyntaxKind.PropertyAccessExpression:
        handleCustomElementsDefine(node, moduleDoc);
        break;
      case ts.SyntaxKind.VariableStatement:
      case ts.SyntaxKind.ExportDeclaration:
      case ts.SyntaxKind.FunctionDeclaration:
      case ts.SyntaxKind.ExportAssignment:
        handleExport((node as ExportType), moduleDoc);
        // handleMixins(node, moduleDoc);
        break;
      case ts.SyntaxKind.ImportDeclaration:
        handleImport(node);
        break;
    }

    ts.forEachChild(node, visitNode);
  }
}