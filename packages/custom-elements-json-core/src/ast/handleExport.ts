
import { JavaScriptModule, Export, VariableDeclaration, FunctionDeclaration } from "custom-elements-json/schema";
import ts from "typescript";
import {
  ExportType,
  hasExportModifier,
  hasDefaultModifier,
  safePush,
  hasNamedExports,
  isReexport,
  isBareModuleSpecifier
} from '../utils';

export function handleExport(node: ExportType, moduleDoc: JavaScriptModule, ignore: string | undefined = undefined) {
  if(node.kind === ts.SyntaxKind.VariableStatement) {
    let _export: Export = {
      kind: 'js',
      name: '',
      declaration: {name:''}
    };
    let _declaration: VariableDeclaration = {
      kind: 'variable',
      name: '',
    };

    if(hasExportModifier(node)) {
      node.declarationList.declarations.forEach(declaration => {
        _export = {
          ..._export,
          kind: "js",
          name: declaration.name.getText(),
          declaration: {
            name: declaration.name.getText(),
            module: moduleDoc.path
          }
        };

        // @TODO: add description, type, default
        _declaration = {
          ..._declaration,
          kind: 'variable',
          name: declaration.name.getText(),
        }

        safePush(_export, _declaration, moduleDoc, ignore);
      });
    } else {
      node.declarationList.declarations.forEach(declaration => {

        // @TODO: add description, type, default
        const _declaration: VariableDeclaration = {
          kind: 'variable',
          name: declaration.name.getText(),
        }

        safePush(null, _declaration, moduleDoc, ignore);
      });
    }
  }

  /**
   * @example export default var1;
   */
  if(node.kind === ts.SyntaxKind.ExportAssignment) {
    // @TODO: var8 can be imported from a different package, module, or declared in the local module. Find where it comes from
    const _export: Export = {
      kind: "js",
      name: "default",
      declaration: {
        name: (node.expression as ts.Identifier).text,
        module: moduleDoc.path
      }
    };
    safePush(_export, null, moduleDoc, ignore);
  }

  if(node.kind === ts.SyntaxKind.ExportDeclaration) {
    /**
     * @example export { var1, var2 };
     */
    if(hasNamedExports(node) && !isReexport(node)) {
      (node as any).exportClause?.elements?.forEach((element: any) => {

        // @TODO: these could be reexports, need to find module or package
        const _export: Export = {
          kind: "js",
          name: element.name.getText(),
          declaration: {
            name: element.propertyName?.getText() || element.name.getText(),
            module: moduleDoc.path
          }
        };

        safePush(_export, null, moduleDoc, ignore);
      });
    }

    /**
     * @example export * from 'foo';
     * @example export * from './my-module.js';
     */
    if(isReexport(node) && !hasNamedExports(node)) {
      const _export: Export = {
        kind: "js",
        name: "*",
        declaration: {
          name: "*",
          package: node.moduleSpecifier!.getText().replace(/'/g, '')
        }
      }
      safePush(_export, null, moduleDoc, ignore);
    }

    /**
     * @example export { var1, var2 } from 'foo';
     * @example export { var1, var2 } from './my-module.js';
     */
    if(isReexport(node) && hasNamedExports(node)) {
      (node as any).exportClause?.elements?.forEach((element: any) => {
        const _export: Export = {
          kind: "js",
          name: element.name.getText(),
          declaration: {
            name: element.propertyName?.getText() || element.name.getText()
          }
        }

        if(isBareModuleSpecifier(node.moduleSpecifier!.getText())) {
          _export.declaration.package = node.moduleSpecifier!.getText().replace(/'/g, '');
        } else {
          _export.declaration.module = node.moduleSpecifier!.getText().replace(/'/g, '');
        }

        safePush(_export, null, moduleDoc, ignore);
      });
    }
  }

  if(node.kind === ts.SyntaxKind.FunctionDeclaration) {
    let _export: Export = {
      kind: 'js',
      name: '',
      declaration: {name:''}
    };
    let _declaration: FunctionDeclaration = {
      kind: 'function',
      name: '',
    };

    if(hasExportModifier(node)) {
      const isDefault = hasDefaultModifier(node);
      _export = {
        ..._export,
        kind: "js",
        name: isDefault ? "default" : node.name?.getText() || "",
        declaration: {
          name: isDefault ? "default" : node.name?.getText() || "",
          module: moduleDoc.path
        }
      }

      // @TODO: add description, type, parameters, returntype
      _declaration = {
        ..._declaration,
        kind: 'function',
        name: isDefault ? "default" : node.name?.getText() || "",
      }

      safePush(_export, _declaration, moduleDoc, ignore);
    }
  }

  /**
   * @example export class Class1 {}
   */
  if(node.kind === ts.SyntaxKind.ClassDeclaration) {
    if(hasExportModifier(node)) {
      const _export: Export = {
        kind: "js",
        name: node?.name?.text || "",
        declaration: {
          name: node?.name?.text || "",
          module: moduleDoc.path
        }
      }
      safePush(_export, null, moduleDoc, ignore);
    }
  }
}