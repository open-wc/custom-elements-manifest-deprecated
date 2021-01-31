import { CustomElementExport, JavaScriptModule } from 'custom-elements-json/schema';
import { customElementsJson } from '../customElementsJson';
import { isValidArray } from '../utils';

export function handleCustomElementsDefine(node: any, moduleDoc: JavaScriptModule) {
  if (node.expression.getText() === 'customElements' && node.name.getText() === 'define') {
    const elementClass = node.parent.arguments[1].text;
    const elementTag = node.parent.arguments[0].text;
    const definitionDoc: CustomElementExport = {
      kind: 'custom-element-definition',
      name: elementTag,
      declaration: {
        name: elementClass,
        module: '',
      },
    };

    // Loop through imports in file to see where the to be defined class comes from, package or local module?
    const foundImport = isValidArray(customElementsJson.imports) && customElementsJson.imports.find((_import: any) => {
      return _import.name === elementClass;
    });

    if(foundImport) {
      if(foundImport.isBareModuleSpecifier) {
        delete definitionDoc.declaration.module;
        definitionDoc.declaration.package = foundImport.importPath;
      } else {
        /**
         * @TODO:
         * This will result in:
         *       {
                  "kind": "custom-element-definition",
                  "name": "my-foo",
                  "declaration": {
                    "name": "MyFoo",
                    "module": "./foo.js"
                  }
                },

         * But should the `module` there be absolute? e.g.: "./fixtures/custom_elements_define/package/foo.js"
         */
        definitionDoc.declaration.module = foundImport.importPath;
      }
    } else {
      definitionDoc.declaration.module = moduleDoc.path;
    }

    console.log(moduleDoc.path);

    moduleDoc.exports!.push(definitionDoc);
  }
}
