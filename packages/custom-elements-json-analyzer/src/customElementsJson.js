import ts from 'typescript';
import { CustomElementsJson } from '@custom-elements-json/helpers';

export class ExtendedCustomElementsJson extends CustomElementsJson {
  currentModule;
  imports;

  setCurrentModule(source) {
    this.currentModule = source;
  }

  setImportsForCurrentModule(imports) {
    this.imports = [...(this.imports || []), ...imports];
  }

  visitCurrentModule(cb) {
    visitNode(this.currentModule);

    function visitNode(node) {
      cb(node);
      ts.forEachChild(node, visitNode);
    }
  }
}

export const customElementsJson = new ExtendedCustomElementsJson();
