import ts from 'typescript';
import { extractJsDoc } from '../utils/extractJsDoc';
import { hasJsDoc, isValidArray } from '../utils';

export function hasParameters(node: any) {
  return isValidArray(node.parameters);
}

export function hasDefaultValue(node: any) {
  return node.initializer !== undefined;
}

export function hasType(node: any) {
  return node.type !== undefined;
}

export function hasOnlyDescription(jsDoc: any) {
  return Object.keys(jsDoc).length === 1 && jsDoc.description && jsDoc.description !== '';
}

/** Gets passed either a MethodDeclaration or a FunctionDeclaration */
export function handleParamsAndReturnType(functionlike: any, node: any): any {
  const parameters: any[] = [];

  if(hasJsDoc(node)) {
    const jsDoc = extractJsDoc(node);
    const hasParams = jsDoc.some((doc: any) => doc.tag === 'param');
    const returnType = jsDoc.find((doc: any) => doc.tag === 'return' || doc.tag === 'returns');
    const hasReturn = returnType !== undefined;
    const onlyDescription = jsDoc.find(hasOnlyDescription)?.description;

    if(onlyDescription) {
      functionlike.description = onlyDescription;
    }

    if(hasParams) {
      jsDoc
        .filter((doc: any) => doc.tag === 'param')
        .forEach((doc: any) => {
          const parameter: any = {};

          if(doc.name && doc.name !== '') {
            parameter.name = doc.name;
          }
          if(doc.type && doc.type !== '') {
            parameter.type = { text: doc.type.replace(/import(.*)\./, '').replace(/(\r\n|\n|\r)/gm, ' ') };
          }
          if(doc.description && doc.description !== '') {
            parameter.description = doc.description.replace('- ', '')
          }
          if(doc.optional) {
            parameter.optional = doc.optional;
          }

          parameters.push(parameter)
        });
    }

    if(hasReturn) {
      functionlike.return = {
        type: { 
          text: returnType.type.replace(/import(.*)\./, '') 
        }
      }
    }
  }

  // TS return type of functionlike
  if(hasType(node)) {
    functionlike.return = {
      type: { text: node.type.getText() }
    }
  }

  if(hasParameters(node)) {
  
    node.parameters.forEach((param: any) => {
      let parameter: any = parameters.find((par: any) => par.name === param.name.getText());
      const parameterAlreadyExists = parameter !== undefined;
      if(!parameterAlreadyExists) {
        parameter = {
          name: param.name.getText(),
        }
      }

      if(hasDefaultValue(param)) {
        parameter.default = param.initializer.getText();
      }

      if(hasType(param)) {
        parameter.type = {text: param.type.getText() }
      }

      if(!parameterAlreadyExists && !(ts.isObjectBindingPattern(param.name) && hasJsDoc(node))) {
        parameters.push(parameter);
      } 
    });
  }

  if(isValidArray(parameters)) {
    functionlike.parameters = parameters;
  }

  return functionlike;
}
