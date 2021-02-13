import {
  JavaScriptModule,
  Export,
  VariableDeclaration,
  FunctionDeclaration,
} from 'custom-elements-manifest/schema';
import ts from 'typescript';
import { handleParamsAndReturnType } from './handleFunctionlike';
import {
  ExportType,
  hasExportModifier,
  hasDefaultModifier,
  safePush,
  hasNamedExports,
  isReexport,
  isBareModuleSpecifier,
  isValidArray
} from '../utils';
import { extractJsDoc } from '../utils/extractJsDoc';

export function handleExport(
  node: ExportType,
  moduleDoc: JavaScriptModule,
  ignore: string | undefined = undefined,
) {
  if (node.kind === ts.SyntaxKind.VariableStatement) {
    const extractedJsDoc = extractJsDoc(node);
    // only get the 'closest' jsDoc
    const jsDoc = extractedJsDoc[extractedJsDoc.length - 1];

    let _export: Export = {
      kind: 'js',
      name: '',
      declaration: { name: '' },
    };
    let _declaration: VariableDeclaration = {
      kind: 'variable',
      name: '',
    };

    if(jsDoc) {
      if('description' in jsDoc){
        _declaration.description = jsDoc.description;
      }
      if('type' in jsDoc){
        _declaration.type = { text: jsDoc.type };
      }
    }

    node.declarationList.declarations.forEach(declaration => {
      if(declaration.type) {
        _declaration.type = {text: declaration.type.getText()}
      }
    });

    if (hasExportModifier(node)) {
      node.declarationList.declarations.forEach(declaration => {
        _export = {
          ..._export,
          kind: 'js',
          name: declaration.name.getText(),
          declaration: {
            name: declaration.name.getText(),
            module: moduleDoc.path,
          },
        };

        // @TODO: add description, type, default
        _declaration = {
          ..._declaration,
          kind: 'variable',
          name: declaration.name.getText(),
        };

        safePush(_export, _declaration, moduleDoc, ignore);
      });
    } else {
      node.declarationList.declarations.forEach(declaration => {
        // @TODO: add description, type, default
        const _declaration: VariableDeclaration = {
          kind: 'variable',
          name: declaration.name.getText(),
        };

        safePush(null, _declaration, moduleDoc, ignore);
      });
    }
  }

  /**
   * @example export default var1;
   */
  if (node.kind === ts.SyntaxKind.ExportAssignment) {
    const _export: Export = {
      kind: 'js',
      name: 'default',
      declaration: {
        name: (node.expression as ts.Identifier).text,
        module: moduleDoc.path,
      },
    };
    safePush(_export, null, moduleDoc, ignore);
  }

  if (node.kind === ts.SyntaxKind.ExportDeclaration) {
    /**
     * @example export { var1, var2 };
     */
    if (hasNamedExports(node) && !isReexport(node)) {
      (node as any).exportClause?.elements?.forEach((element: any) => {
        const _export: Export = {
          kind: 'js',
          name: element.name.getText(),
          declaration: {
            name: element.propertyName?.getText() || element.name.getText(),
            module: moduleDoc.path,
          },
        };

        safePush(_export, null, moduleDoc, ignore);
      });
    }

    /**
     * @example export * from 'foo';
     * @example export * from './my-module.js';
     */
    if (isReexport(node) && !hasNamedExports(node)) {
      const _export: Export = {
        kind: 'js',
        name: '*',
        declaration: {
          name: '*',
          package: node.moduleSpecifier!.getText().replace(/'/g, ''),
        },
      };
      safePush(_export, null, moduleDoc, ignore);
    }

    /**
     * @example export { var1, var2 } from 'foo';
     * @example export { var1, var2 } from './my-module.js';
     */
    if (isReexport(node) && hasNamedExports(node)) {
      (node as any).exportClause?.elements?.forEach((element: any) => {
        const _export: Export = {
          kind: 'js',
          name: element.name.getText(),
          declaration: {
            name: element.propertyName?.getText() || element.name.getText(),
          },
        };

        if (isBareModuleSpecifier(node.moduleSpecifier!.getText())) {
          _export.declaration.package = node.moduleSpecifier!.getText().replace(/'/g, '');
        } else {
          _export.declaration.module = node.moduleSpecifier!.getText().replace(/'/g, '');
        }

        safePush(_export, null, moduleDoc, ignore);
      });
    }
  }

  if (node.kind === ts.SyntaxKind.FunctionDeclaration) {
    let _export: Export = {
      kind: 'js',
      name: '',
      declaration: { name: '' },
    };
    let _declaration: FunctionDeclaration = {
      kind: 'function',
      name: '',
    };

    if (hasExportModifier(node)) {
      const isDefault = hasDefaultModifier(node);
      _export = {
        ..._export,
        kind: 'js',
        name: isDefault ? 'default' : node.name?.getText() || '',
        declaration: {
          name: isDefault ? 'default' : node.name?.getText() || '',
          module: moduleDoc.path,
        },
      };

      // @TODO: add description, type, parameters, returntype
      _declaration = {
        ..._declaration,
        kind: 'function',
        name: isDefault ? 'default' : node.name?.getText() || '',
      };

      _declaration = handleParamsAndReturnType(_declaration, node);

      safePush(_export, _declaration, moduleDoc, ignore);
    }
  }

  /**
   * @example export class Class1 {}
   */
  if (node.kind === ts.SyntaxKind.ClassDeclaration) {
    if (hasExportModifier(node)) {
      const _export: Export = {
        kind: 'js',
        name: node?.name?.text || '',
        declaration: {
          name: node?.name?.text || '',
          module: moduleDoc.path,
        },
      };
      safePush(_export, null, moduleDoc, ignore);
    }
  }
}
