import ts from 'typescript';
import { Attribute, CustomElement } from 'custom-elements-json/schema';
import { extractJsDoc } from '../utils/extractJsDoc';

export function handleAttributes(node: any, classDoc: CustomElement) {
  const attributes: Attribute[] = [];

  /** Extract attributes from JSdoc, if any */
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
    node.members.forEach((member: ts.PropertyDeclaration | ts.GetAccessorDeclaration) => {
      if (ts.isPropertyDeclaration(member) || ts.isGetAccessor(member)) {
        if (member.name.getText() === 'observedAttributes') {
          if (ts.isPropertyDeclaration(member)) {
            (member as any).initializer.elements.forEach((element: any) => {
              if (
                element.text !== undefined &&
                !attributes.some(attr => attr.name === element.text)
              ) {
                attributes.push({
                  name: element.text,
                });
              }
            });
          }

          if (ts.isGetAccessor(member)) {
            const returnStatement = (member as any).body.statements.find(
              (statement: any) => statement.kind === ts.SyntaxKind.ReturnStatement,
            );
            returnStatement.expression.elements.forEach((element: any) => {
              if (
                element.text !== undefined &&
                !attributes.some(attr => attr.name === element.text)
              ) {
                attributes.push({
                  name: element.text,
                });
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
