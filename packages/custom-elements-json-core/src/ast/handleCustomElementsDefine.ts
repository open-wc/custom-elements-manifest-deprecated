import { CustomElementExport, JavaScriptModule } from 'custom-elements-json/schema';

export function handleCustomElementsDefine(node: any, moduleDoc: JavaScriptModule) {
  if(node.expression.getText() === 'customElements' && node.name.getText() === 'define') {
    const definitionDoc: CustomElementExport = {
      kind: "custom-element-definition",
      name: node.parent.arguments[0].text,
      declaration: {
        name: node.parent.arguments[1].text,
        module: ""
      }
    }
    moduleDoc.exports!.push(definitionDoc);
  }
}