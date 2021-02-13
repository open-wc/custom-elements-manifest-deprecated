import ts from 'typescript';
import {
  CustomElement,
  VariableDeclaration,
  FunctionDeclaration,
  ClassDeclaration,
  JavaScriptModule,
  Export,
} from 'custom-elements-manifest/schema';
import { JSDoc } from './extractJsDoc';

export function isValidArray(array: any) {
  return Array.isArray(array) && array.length > 0;
}

export function pushSafe(array: any, item: any): any[] {
  if (isValidArray(array)) {
    array.push(item);
  } else {
    array = [item];
  }
  return array;
}

/** Merges the jsdoc comment information with found properties registered in a different way */
export function mergeJsDocWithPropAndPush(classDoc: any, classMember: any) {
  const prop = classDoc.members?.find((member: any) => member.name === classMember.name);
  const propAlreadyExists = prop !== undefined;
  if (propAlreadyExists) {
    Object.assign(prop, classMember);
  } else {
    classDoc.members = pushSafe(classDoc.members, classMember);
  }
}

/** CLASS */
export function hasModifiers(node: any): boolean {
  return isValidArray(node.modifiers);
}

export function hasJsDoc(node: any): boolean {
  return isValidArray(node.jsDoc);
}

export function hasStaticKeyword(node: any): boolean {
  return !!node?.modifiers?.find((mod: any) => mod.kind === ts.SyntaxKind.StaticKeyword);
}

export function isAlsoProperty(node: any) {
  let result = true;
  ((node?.initializer as ts.ObjectLiteralExpression) || node)?.properties?.forEach((property: any) => {
    if (
      (property.name as ts.Identifier).text === 'attribute' &&
      property.initializer.kind === ts.SyntaxKind.FalseKeyword
    ) {
      result = false;
    }
  });
  return result;
}

export function getAttrName(node: any): string | undefined {
  let result = undefined;
  ((node?.initializer as ts.ObjectLiteralExpression) || node)?.properties?.forEach((property: any) => {
    if (
      (property.name as ts.Identifier).text === 'attribute' &&
      property.initializer.kind !== ts.SyntaxKind.FalseKeyword
    ) {
      result = property.initializer.text;
    }
  });
  return result;
}

export function getReturnVal(node: any) {
  if (ts.isGetAccessor(node)) {
    return (node.body?.statements?.find(
      (statement: any) => statement.kind === ts.SyntaxKind.ReturnStatement,
    ) as ts.ReturnStatement)?.expression;
  } else {
    return node.initializer;
  }
}

export function alreadyHasAttributes(doc: CustomElement): boolean {
  return isValidArray(doc.attributes);
}

export function hasPropertyDecorator(
  node: ts.PropertyDeclaration | ts.GetAccessorDeclaration | ts.SetAccessorDeclaration,
): boolean {
  return (
    isValidArray(node.decorators) &&
    node.decorators!.some((decorator: any) => { 
      return ts.isDecorator(decorator) && (decorator.expression as any).expression.getText() === 'property'
    })
  );
}

/** EXPORTS */
export type ExportType =
  | ts.VariableStatement
  | ts.ExportDeclaration
  | ts.FunctionDeclaration
  | ts.ClassDeclaration
  | ts.ExportAssignment;

export function hasExportModifier(node: ExportType): boolean {
  if (isValidArray(node.modifiers)) {
    if (node.modifiers!.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword)) {
      return true;
    }
  }
  return false;
}

export function hasDefaultModifier(node: ExportType): boolean {
  if (isValidArray(node.modifiers)) {
    if (node.modifiers!.some(mod => mod.kind === ts.SyntaxKind.DefaultKeyword)) {
      return true;
    }
  }
  return false;
}

export function safePush(
  _export: Export | null,
  _declaration: VariableDeclaration | FunctionDeclaration | ClassDeclaration | null,
  moduleDoc: JavaScriptModule,
  ignore: string | undefined,
) {
  if (_export) {
    if (isValidArray(moduleDoc.exports)) {
      moduleDoc.exports!.push(_export);
    } else {
      moduleDoc.exports = [_export];
    }
  }

  if (_declaration) {
    const alreadyExists = !!moduleDoc.declarations?.find((declaration: any) => declaration?.name !== 'default' && declaration?.name === _declaration?.name);
    
    if(alreadyExists) return;
    if (ignore !== undefined && _declaration.name === ignore) return;
    if (isValidArray(moduleDoc.declarations)) {
      moduleDoc.declarations.push(_declaration);
    } else {
      moduleDoc.declarations = [_declaration];
    }
  }
}

/**
 *
 * @example export { var1, var2 };
 */
export function hasNamedExports(node: ts.ExportDeclaration): boolean {
  if (isValidArray((node as any).exportClause?.elements)) {
    return true;
  }
  return false;
}

/**
 * @example export { var1, var2 } from 'foo';
 */
export function isReexport(node: ts.ExportDeclaration): boolean {
  if (node.moduleSpecifier !== undefined) {
    return true;
  }
  return false;
}

export interface Mixin {
  name: string;
}

export function extractMixins(jsDocs: JSDoc[]): Mixin[] {
  if (isValidArray(jsDocs)) {
    return jsDocs
      .filter(jsDoc => jsDoc.tag === 'mixin')
      .map(jsDoc => ({
        name: jsDoc.type,
      }));
  } else {
    return [];
  }
}

export function hasMixins(mixins: Mixin[]) {
  return isValidArray(mixins);
}

/** IMPORTS */

/** @example import defaultExport from 'foo'; */
export function hasDefaultImport(node: ts.ImportDeclaration): boolean {
  // eslint-disable-line
  return !!node?.importClause?.name;
}

/** @example import {namedA, namedB} from 'foo'; */
export function hasNamedImport(node: any): boolean {
  return isValidArray(node?.importClause?.namedBindings?.elements);
}

/** @example import * as name from './my-module.js'; */
export function hasAggregatingImport(node: any): boolean {
  return !!node?.importClause?.namedBindings?.name && !hasNamedImport(node);
}

export function isBareModuleSpecifier(specifier: string): boolean {
  return !!specifier.replace(/'/g, '')[0].match(/[@a-zA-Z]/g);
}

export interface Import {
  name: string;
  kind: 'default' | 'named' | 'aggregate';
  importPath: string;
  isBareModuleSpecifier: boolean;
}
