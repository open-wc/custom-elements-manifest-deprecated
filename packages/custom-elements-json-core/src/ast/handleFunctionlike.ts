import ts from 'typescript';
import { extractJsDoc } from '../utils/extractJsDoc';
import { hasJsDoc, isValidArray } from '../utils';

function hasParameters(node: any) {
  return isValidArray(node.parameters);
}

function hasDefaultValue(node: any) {
  return node.initializer !== undefined;
}

function hasType(node: any) {
  return node.type !== undefined;
}

function hasOnlyDescription(jsDoc: any) {
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
            parameter.type = doc.type.replace(/import(.*)\./, '');
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
        type: returnType.type.replace(/import(.*)\./, '')
      }
    }
  }

  // return type of functionlike
  if(hasType(node)) {
    functionlike.return = {
      type: node.type.getText(),
    }
  }

  if(hasParameters(node)) {
    node.parameters.forEach((param: any) => {
      // find existing param from jsdoc or create new
      let parameter: any = parameters.find((par: any) => par.name === param.name.getText());
      const parameterAlreadyExists = parameter !== undefined;
      if(!parameterAlreadyExists) {
        parameter = {
          name: param.name.text
        }
      }

      if(hasDefaultValue(param)) {
        parameter.default = param.initializer.getText();
      }

      if(hasType(param)) {
        parameter.type = {type: param.type.getText() }
      }

      if(!parameterAlreadyExists) {
        parameters.push(parameter);
      }
    });
  }

  if(isValidArray(parameters)) {
    functionlike.parameters = parameters;
  }

  return functionlike;
}
