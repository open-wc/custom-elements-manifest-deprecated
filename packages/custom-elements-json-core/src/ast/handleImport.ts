import { JavaScriptModule } from "custom-elements-json/schema";
import ts from "typescript";
import { customElementsJson } from '../customElementsJson';

/** @example import defaultExport from 'foo'; */
function hasDefaultImport(node: ts.ImportDeclaration): boolean { // eslint-disable-line
  return !!node?.importClause?.name;
}

/** @example import {namedA, namedB} from 'foo'; */
function hasNamedImport(node: any): boolean {
  return Array.isArray(node?.importClause?.namedBindings?.elements) && node.importClause.namedBindings.elements.length > 0;
}

/** @example import * as name from './my-module.js'; */
function hasAggregatingImport(node: any): boolean {
  return !!node?.importClause?.namedBindings?.name && !hasNamedImport(node);
}

function isBaremoduleSpecifier(specifier: string): boolean {
  return !!specifier[0].match(/[a-zA-Z]/g);
}

export interface Import {
  name: string;
  kind: "default" | "named" | "aggregate",
  importPath: string;
  isBaremoduleSpecifier: boolean
}

/**
 * Handles the imports for a module, so they can later be resolved
 */
export function handleImport(node: any) {
  const imports: Import[] = [];

  /** @example import defaultExport from 'foo'; */
  if(hasDefaultImport(node)) {
    const _import: Import = {
      name: node.importClause.name.text,
      kind: "default",
      importPath: node.moduleSpecifier.text,
      isBaremoduleSpecifier: isBaremoduleSpecifier(node.moduleSpecifier.text)
    }
    imports.push(_import);
  }

  /**
   * @example import { export1, export2 } from 'foo';
   * @example import { export1 as alias1 } from 'foo';
   * @example import { export1, export2 as alias2 } from 'foo';
   */
  if(hasNamedImport(node)) {
    node.importClause.namedBindings.elements.forEach((element: ts.ImportSpecifier) => {
      const _import: Import = {
        name: element.name.text,
        kind: "named",
        importPath: node.moduleSpecifier.text,
        isBaremoduleSpecifier: isBaremoduleSpecifier(node.moduleSpecifier.text)
      }
      imports.push(_import);
    });
  }

  /** @example import * as name from './my-module.js'; */
  if(hasAggregatingImport(node)) {
    const _import: Import = {
      name: node.importClause.namedBindings.name.text,
      kind: "aggregate",
      importPath: node.moduleSpecifier.text,
      isBaremoduleSpecifier: isBaremoduleSpecifier(node.moduleSpecifier.text)
    }
    imports.push(_import);
  }

  customElementsJson.setImportsForCurrentModule(imports);
}