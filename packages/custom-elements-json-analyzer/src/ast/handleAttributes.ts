import ts from 'typescript';
import { Attribute, CustomElement } from 'custom-elements-manifest/schema';
import { extractJsDoc, extractJsDocCommentFromText, computeLeadingComment } from '../utils/extractJsDoc';
import { isValidArray } from '../utils';

export function handleAttributes(node: any, classDoc: CustomElement) {
  const attributes: Attribute[] = [];

  /** Extract attributes from JSdoc above class, if present */
  const jsDocs = extractJsDoc(node);
  if (Array.isArray(jsDocs) && jsDocs.length > 0) {
    jsDocs
      .filter(jsDoc => jsDoc.tag === 'attr' || jsDoc.tag === 'attribute')
      .forEach(jsDoc => {
        const attribute: Attribute = {
          name: jsDoc.name,
          description: jsDoc.description.replace('- ', '')
        }

        if(jsDoc.type) {
          attribute.type = { text: jsDoc.type }
        }

        attributes.push(attribute);
      });
  }

  node.members &&
    node.members.forEach((member: ts.PropertyDeclaration | ts.GetAccessorDeclaration) => {
      if (ts.isPropertyDeclaration(member) || ts.isGetAccessor(member)) {
        if (member.name.getText() === 'observedAttributes') {
          if (ts.isPropertyDeclaration(member)) {
            (member as any).initializer.elements.forEach((element: any) => {
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
            const returnStatement = (member as any)?.body?.statements?.find(
              (statement: any) => statement.kind === ts.SyntaxKind.ReturnStatement,
            );
            returnStatement?.expression?.elements?.forEach((element: ts.StringLiteral) => {
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

function createAttribute(node: any, element:any): Attribute {
  const attribute: Attribute = {
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
    jsDoc.forEach((doc: any) => {
      if(doc.tag === 'type') {
        attribute.type = { text: doc.type }
      }
      if(doc.description !== '') {
        attribute.description = doc.description.replace('- ', '');
      }
      if(doc.tag === 'property') {
        attribute.fieldName = doc.name;
      }
    });
  }
  return attribute
}