import path from 'path';
import fs from 'fs';
import globby from 'globby';
import ts from 'typescript';
import { customElementsJson } from './customElementsJson';
import { Package, Declaration, JavaScriptModule, CustomElement, Export } from 'custom-elements-json/schema';

import { handleClass } from './ast/handleClass';
import { handleCustomElementsDefine } from './ast/handleCustomElementsDefine';

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
    visit(sourceFile, (customElementsJson.modules.find(_module => _module.path === relativeModulePath) as JavaScriptModule));
  });



  /** POST-PROCESSING, e.g.: linking class to definitions etc */
  // @TODO: Find the module path for a superclass
  const classes = customElementsJson.getClasses();
  const definitions = customElementsJson.getDefinitions(); // CustomElementExports


  // Match modulePath for definition declarations
  for(const definition of definitions) {
    for(const _module of customElementsJson.modules) {
      const modulePath = _module.path;
      const match = [...<Declaration[]>_module.declarations, ...<Export[]>_module.exports]
        .some(classDoc => classDoc.name === definition.declaration.name);

      if(match) {
        definition.declaration.module = modulePath;
        break;
      }
    }
  }

  // Match tagNames for classDocs
  classes.forEach((customElement: CustomElement) => {
    customElement.tagName = definitions.find(def => def.declaration.name === customElement.name).name;
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
        break;
      case ts.SyntaxKind.PropertyAccessExpression:
        handleCustomElementsDefine(node, moduleDoc);
        break;
    }

    ts.forEachChild(node, visitNode);
  }
}