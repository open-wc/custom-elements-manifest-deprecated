import path from 'path';
import fs from 'fs';
import globby from 'globby';
import ts from 'typescript';
import { customElementsJson } from './customElementsJson';
import { Package, Declaration, JavaScriptModule, CustomElement, Export } from 'custom-elements-json/schema';
import { ExportType } from './ast/handleExport';

import { handleClass } from './ast/handleClass';
import { handleCustomElementsDefine } from './ast/handleCustomElementsDefine';
import { handleExport } from './ast/handleExport';

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
    customElement.tagName = definitions.find(def => def && def.declaration && def.declaration.name === customElement.name)?.name;
  });

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
        break;
    }

    ts.forEachChild(node, visitNode);
  }
}