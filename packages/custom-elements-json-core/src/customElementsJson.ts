import ts from 'typescript';
import { CustomElementsJson } from '@custom-elements-json/helpers';

export class ExtendedCustomElementsJson extends CustomElementsJson {
  currentModule: any;

  setCurrentModule(source: any) {
    this.currentModule = source;
  }

  visitCurrentModule(cb: (node: any) => void) {
    visitNode(this.currentModule);

    function visitNode(node: ts.Node) {
      cb(node)
      ts.forEachChild(node, visitNode);
    }
  }
}



export const customElementsJson = new ExtendedCustomElementsJson();
