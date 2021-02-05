import { CustomElementExport, JavaScriptModule } from 'custom-elements-json/schema';
import { customElementsJson } from '../customElementsJson';
import { isValidArray } from '../utils';
import path from 'path';

export function handleCustomElementsDefine(node: any, moduleDoc: JavaScriptModule) {
  if (
    (node.expression.getText() === 'customElements' || node.expression.getText() === 'window.customElements') && 
    node.name.getText() === 'define'
  ) {
    const elementClass = node.parent.arguments[1].text;
    const elementTag = node.parent.arguments[0].text;
    const definitionDoc: CustomElementExport = {
      kind: 'custom-element-definition',
      name: elementTag,
      declaration: {
        name: elementClass,
      },
    };

    // Loop through imports in file to see where the to be defined class comes from, package or local module?
    const foundImport = isValidArray(customElementsJson.imports) && customElementsJson.imports.find((_import: any) => {
      return _import.name === elementClass;
    });

    if(foundImport) {
      if(foundImport.isBareModuleSpecifier) {
        definitionDoc.declaration.package = foundImport.importPath;
      } else {
        definitionDoc.declaration.module = path.resolve(path.dirname(moduleDoc.path), foundImport.importPath).replace(process.cwd(), '');
      }
    } else {
      definitionDoc.declaration.module = moduleDoc.path;
    }

    moduleDoc.exports!.push(definitionDoc);
  }
}
