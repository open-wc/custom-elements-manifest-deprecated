import ts from 'typescript';
import { hasDefaultValue, hasType } from './handleFunctionlike';
import { extractJsDoc } from '../utils/extractJsDoc';

interface Parameter {
  default?: string,
  type?: { text: string },
  name: string,
  description?: string
}

const has = (items: any): boolean => Array.isArray(items) && items?.length > 0;

function createParams(node: any): Parameter[] {
  let parameters: Parameter[] = [];

  node?.parameters?.forEach((param: any) => {
    const parameter: Parameter = {
      name: param.name.getText(),
    }

    if(hasDefaultValue(param)) {
      parameter.default = param.initializer.getText();
    }

    if(hasType(param)) {
      parameter.type = {text: param.type.getText() }
    }

    parameters.push(parameter);
  });

  const isArrowFunctionMixinAndHasJsDoc = !!node?.parent?.parent?.parent?.jsDoc;
  const isFunctionMixinAndHasJsDoc = !!node?.jsDoc;

  if(isArrowFunctionMixinAndHasJsDoc) {
    parameters = [];
    const jsDoc = extractJsDoc(node?.parent?.parent?.parent).filter((jsDoc: any) => jsDoc.tag === 'param');
    jsDoc.forEach((jsDoc: any) => {
      const parameter: Parameter = {
        name: jsDoc.name,
      }

      if('type' in jsDoc) {
        parameter.type = { text: jsDoc?.type?.replace(/import(.*)\./, '') }
      }

      if('description' in jsDoc) {
        parameter.description = jsDoc?.description
      }
      parameters.push(parameter)
    });
  }

  if(isFunctionMixinAndHasJsDoc) {
    parameters = [];
    const jsDoc = extractJsDoc(node).filter((jsDoc: any) => jsDoc.tag === 'param');
    jsDoc.forEach((jsDoc: any) => {
      const parameter: Parameter = {
        name: jsDoc.name,
      }

      if('type' in jsDoc) {
        parameter.type = { text: jsDoc?.type?.replace(/import(.*)\./, '') }
      }

      if('description' in jsDoc) {
        parameter.description = jsDoc?.description
      }
      parameters.push(parameter)
    });
  }

  return parameters;
}

export function getMixin(
  node: ts.VariableStatement | ts.FunctionDeclaration,
): any {
  const classDoc: any = {
    kind: 'mixin',
    description: '',
    name:'',
    cssProperties: [],
    cssParts: [],
    slots: [],
    members: [],
  };

  if (ts.isVariableStatement(node) || ts.isFunctionDeclaration(node)) {
    if (ts.isVariableStatement(node)) {
      /**
       * @example const MyMixin = klass => class MyMixin extends klass {}
       * @example export const MyMixin = klass => class MyMixin extends klass {}
       */
      const variableDeclaration = node.declarationList.declarations.find(declaration =>
        ts.isVariableDeclaration(declaration),
      );
      if (variableDeclaration) {
        const body = (variableDeclaration?.initializer as ts.ArrowFunction)?.body;
        const params = createParams(variableDeclaration?.initializer);
        if(has(params)) {
          classDoc.parameters = params;
        }

        if (body && ts.isClassExpression(body)) {
          return { node: body, classDoc };
        }

        /**
         * @example const MyMixin = klass => { return class MyMixin extends Klass{} }
         */
        if (body && ts.isBlock(body)) {
          const returnStatement = body.statements.find(statement =>
            ts.isReturnStatement(statement),
          );
          if (returnStatement && (returnStatement as any)?.expression?.kind && ts.isClassExpression((returnStatement as any).expression)) {
            return { node: (returnStatement as any).expression, classDoc };
          }
        }
      }
    }

    /**
     *  @example function MyMixin(klass) { return class MyMixin extends Klass{} }
     */
    if (ts.isFunctionDeclaration(node)) {
      const { body } = node;
      if (body && ts.isBlock(body)) {
        const params = createParams(node);
        if(has(params)) {
          classDoc.parameters = params;
        }

        const returnStatement = body.statements.find(statement => ts.isReturnStatement(statement));
        if (returnStatement && ts.isClassExpression((returnStatement as any).expression)) {
          return { node: (returnStatement as any).expression, classDoc };
        }
      }
    }
  }
  return false;
}
