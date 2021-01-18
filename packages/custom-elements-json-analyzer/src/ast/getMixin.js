import ts from 'typescript';

export function getMixin(
  node
) {
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
        const body = (variableDeclaration?.initializer)?.body;
        if (body && ts.isClassExpression(body)) {
          return body;
        }

        /**
         * @example const MyMixin = klass => { return class MyMixin extends Klass{} }
         */
        if (body && ts.isBlock(body)) {
          const returnStatement = body.statements.find(statement =>
            ts.isReturnStatement(statement),
          );
          if (returnStatement && ts.isClassExpression((returnStatement).expression)) {
            return (returnStatement).expression;
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
        const returnStatement = body.statements.find(statement => ts.isReturnStatement(statement));
        if (returnStatement && ts.isClassExpression((returnStatement).expression)) {
          return (returnStatement).expression;
        }
      }
    }
  }
  return false;
}
