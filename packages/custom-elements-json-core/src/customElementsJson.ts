import { CustomElementsJson } from '@custom-elements-json/helpers';
import ts from 'typescript';
import { Import } from './utils';

export class ExtendedCustomElementsJson extends CustomElementsJson {
  currentModule: ts.Node | undefined;
  imports: Import[];
  constructor() {
    super();
    this.imports = [];
  }

  setCurrentModule(source: ts.Node) {
    this.currentModule = source;
  }

  setImportsForCurrentModule(imports: Import[]) {
    this.imports = [...(this.imports || []), ...imports];
  }

  visitCurrentModule(cb: (node: ts.Node) => void) {
    function visitNode(node: ts.Node) {
      cb(node);
      ts.forEachChild(node, visitNode);
    }
    if (this.currentModule) {
      visitNode(this.currentModule);
    }
  }
}

export const customElementsJson = new ExtendedCustomElementsJson();
