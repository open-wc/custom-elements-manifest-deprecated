import ts from 'typescript';
import { customElementsJson } from '../customElementsJson';
import {
  hasDefaultImport,
  hasNamedImport,
  hasAggregatingImport,
  isBareModuleSpecifier,
  Import,
} from '../utils';

/**
 * Gathers the imports for a module, so that declarations can later be resolved
 * Imports are removed from the customElementsJson object after the link phase
 */
export function handleImport(node: any) {
  const imports: Import[] = [];

  /** @example import defaultExport from 'foo'; */
  if (hasDefaultImport(node)) {
    const _import: Import = {
      name: node.importClause.name.text,
      kind: 'default',
      importPath: node.moduleSpecifier.text,
      isBareModuleSpecifier: isBareModuleSpecifier(node.moduleSpecifier.text),
    };
    imports.push(_import);
  }

  /**
   * @example import { export1, export2 } from 'foo';
   * @example import { export1 as alias1 } from 'foo';
   * @example import { export1, export2 as alias2 } from 'foo';
   */
  if (hasNamedImport(node)) {
    node.importClause.namedBindings.elements.forEach((element: ts.ImportSpecifier) => {
      const _import: Import = {
        name: element.name.text,
        kind: 'named',
        importPath: node.moduleSpecifier.text,
        isBareModuleSpecifier: isBareModuleSpecifier(node.moduleSpecifier.text),
      };
      imports.push(_import);
    });
  }

  /** @example import * as name from './my-module.js'; */
  if (hasAggregatingImport(node)) {
    const _import: Import = {
      name: node.importClause.namedBindings.name.text,
      kind: 'aggregate',
      importPath: node.moduleSpecifier.text,
      isBareModuleSpecifier: isBareModuleSpecifier(node.moduleSpecifier.text),
    };
    imports.push(_import);
  }

  customElementsJson.setImportsForCurrentModule(imports);
}
