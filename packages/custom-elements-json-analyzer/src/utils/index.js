import ts from 'typescript';
import {
  CustomElement,
  VariableDeclaration,
  FunctionDeclaration,
  ClassDeclaration,
  JavaScriptModule,
  Export,
} from 'custom-elements-json/schema';
import { JSDoc } from './extractJsDoc';

export function isValidArray(array) {
  return Array.isArray(array) && array.length > 0;
}

export function pushSafe(array, item) {
  if (isValidArray(array)) {
    array.push(item);
  } else {
    array = [item];
  }
  return array;
}

/** Merges the jsdoc comment information with found properties registered in a different way */
export function mergeJsDocWithPropAndPush(classDoc, classMember) {
  const prop = classDoc.members?.find((member) => member.name === classMember.name);
  const propAlreadyExists = prop !== undefined;
  if (propAlreadyExists) {
    Object.assign(prop, classMember);
  } else {
    classDoc.members = pushSafe(classDoc.members, classMember);
  }
}

/** CLASS */
export function hasModifiers(node) {
  return isValidArray(node.modifiers);
}

export function hasJsDoc(node) {
  return isValidArray(node.jsDoc);
}

export function hasStaticKeyword(node) {
  return !!node?.modifiers?.find((mod) => mod.kind === ts.SyntaxKind.StaticKeyword);
}

export function isAlsoProperty(node) {
  let result = true;
  ((node.initializer) || node).properties.forEach((property) => {
    if (
      (property.name).text === 'attribute' &&
      property.initializer.kind === ts.SyntaxKind.FalseKeyword
    ) {
      result = false;
    }
  });
  return result;
}

export function getAttrName(node) {
  let result = undefined;
  ((node.initializer) || node).properties.forEach((property) => {
    if (
      (property.name).text === 'attribute' &&
      property.initializer.kind !== ts.SyntaxKind.FalseKeyword
    ) {
      result = property.initializer.text;
    }
  });
  return result;
}

export function getReturnVal(node) {
  if (ts.isGetAccessor(node)) {
    return (node.body.statements.find(
      (statement) => statement.kind === ts.SyntaxKind.ReturnStatement,
    )).expression;
  } else {
    return node.initializer;
  }
}

export function alreadyHasAttributes(doc) {
  return isValidArray(doc.attributes);
}

export function hasPropertyDecorator(
  node,
) {
  return (
    isValidArray(node.decorators) &&
    node.decorators.some((decorator) => ts.isDecorator(decorator))
  );
}

export function hasExportModifier(node) {
  if (isValidArray(node.modifiers)) {
    if (node.modifiers.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword)) {
      return true;
    }
  }
  return false;
}

export function hasDefaultModifier(node) {
  if (isValidArray(node.modifiers)) {
    if (node.modifiers.some(mod => mod.kind === ts.SyntaxKind.DefaultKeyword)) {
      return true;
    }
  }
  return false;
}

export function safePush(
  _export,
  _declaration,
  moduleDoc,
  ignore
) {
  if (_export) {
    if (isValidArray(moduleDoc.exports)) {
      moduleDoc.exports.push(_export);
    } else {
      moduleDoc.exports = [_export];
    }
  }

  if (_declaration) {
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
export function hasNamedExports(node) {
  if (isValidArray(node.exportClause?.elements)) {
    return true;
  }
  return false;
}

/**
 * @example export { var1, var2 } from 'foo';
 */
export function isReexport(node) {
  if (node.moduleSpecifier !== undefined) {
    return true;
  }
  return false;
}


export function extractMixins(jsDocs) {
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

export function hasMixins(mixins) {
  return isValidArray(mixins);
}

/** IMPORTS */

/** @example import defaultExport from 'foo'; */
export function hasDefaultImport(node) {
  // eslint-disable-line
  return !!node?.importClause?.name;
}

/** @example import {namedA, namedB} from 'foo'; */
export function hasNamedImport(node) {
  return isValidArray(node?.importClause?.namedBindings?.elements);
}

/** @example import * as name from './my-module.js'; */
export function hasAggregatingImport(node) {
  return !!node?.importClause?.namedBindings?.name && !hasNamedImport(node);
}

export function isBareModuleSpecifier(specifier) {
  return !!specifier.replace(/'/g, '')[0].match(/[a-zA-Z]/g);
}
