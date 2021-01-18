import ts from 'typescript';
import { extractJsDoc, extractJsDocCommentFromText, computeLeadingComment } from '../utils/extractJsDoc';
import { isValidArray } from '../utils';

export function handleAttributes(node, classDoc) {
  const attributes = [];

  /** Extract attributes from JSdoc above class, if present */
  const jsDocs = extractJsDoc(node);
  if (Array.isArray(jsDocs) && jsDocs.length > 0) {
    jsDocs
      .filter(jsDoc => jsDoc.tag === 'attr' || jsDoc.tag === 'attribute')
      .forEach(jsDoc => {
        attributes.push({
          name: jsDoc.name,
          type: { type: jsDoc.type },
          description: jsDoc.description.replace('- ', ''),
        });
      });
  }

  node.members &&
    node.members.forEach((member) => {
      if (ts.isPropertyDeclaration(member) || ts.isGetAccessor(member)) {
        if (member.name.getText() === 'observedAttributes') {
          if (ts.isPropertyDeclaration(member)) {
            member.initializer.elements.forEach((element) => {
              if (
                element.text !== undefined &&
                !attributes.some(attr => attr.name === element.text)
              ) {
                const attribute = createAttribute(node, element);
                attributes.push(attribute);
              }
            });
          }

          if (ts.isGetAccessor(member)) {
            const returnStatement = (member).body.statements.find(
              (statement) => statement.kind === ts.SyntaxKind.ReturnStatement,
            );
            returnStatement.expression.elements.forEach((element) => {
              if (
                element.text !== undefined &&
                !attributes.some(attr => attr.name === element.text)
              ) {
                const attribute = createAttribute(node, element);
                attributes.push(attribute);
              }
            });
          }
        }
      }
    });

  if (attributes.length > 0) {
    classDoc.attributes = attributes;
  }
}

function createAttribute(node, element) {
  const attribute = {
    name: element.text
  };

  /**
   * handle JSDoc
   * In this case, there wont be a `.jsdoc` property on the node, just a `.leadingComments` property
   * so we have to compute the JSDoc comment ourself
   */
  const comment = computeLeadingComment(node, element);
  const jsDoc = extractJsDocCommentFromText(comment);

  if(isValidArray(jsDoc)) {
    jsDoc.forEach((doc) => {
      if(doc.tag === 'type') {
        attribute.type = { type: doc.type }
      }
      if(doc.description !== '') {
        attribute.description = doc.description;
      }
      if(doc.tag === 'property') {
        attribute.fieldName = doc.name;
      }
    });
  }
  return attribute
}