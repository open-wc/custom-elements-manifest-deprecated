import ts from 'typescript';
import { handleEvents } from './handleEvents';
import { handleAttributes } from './handleAttributes';
import { ClassDeclaration, ClassMember, CustomElement, JavaScriptModule } from 'custom-elements-json/schema';
import { extractJsDoc } from '../utils/extractJsDoc';

export function handleClass(node: any, moduleDoc: JavaScriptModule) {

  const classDoc: CustomElement = {
    "kind": "class",
    "description": "",
    "name": node.name.getText(),
    "cssProperties": [],
    "parts": [],
    "slots": [],
  }

  /** Extract cssProperties, cssParts and slots from JSdoc, if any */
  const jsDocs = extractJsDoc(node);
  if(Array.isArray(jsDocs) && jsDocs.length > 0) {
    jsDocs.filter(jsDoc => jsDoc.tag === 'cssprop' || jsDoc.tag === 'cssproperty')
      .forEach(jsDoc => {
        classDoc.cssProperties!.push({
          name: jsDoc.name,
          description: jsDoc.description.replace('- ', ''),
        });
      });

    jsDocs.filter(jsDoc => jsDoc.tag === 'csspart')
      .forEach(jsDoc => {
        classDoc.parts!.push({
          name: jsDoc.name,
          description: jsDoc.description.replace('- ', ''),
        });
      });

    jsDocs.filter(jsDoc => jsDoc.tag === 'slot')
      .forEach(jsDoc => {
        classDoc.slots!.push({
          name: jsDoc.name,
          description: jsDoc.description.replace('- ', ''),
        });
      });
  }

  if(classDoc.cssProperties && classDoc.cssProperties.length === 0) {
    delete classDoc.cssProperties;
  }

  if(classDoc.parts && classDoc.parts.length === 0) {
    delete classDoc.parts;
  }

  if(classDoc.slots && classDoc.slots.length === 0) {
    delete classDoc.slots;
  }

  handleAttributes(node, classDoc);
  handleEvents(node, classDoc);

  if(node.heritageClauses.length > 0) {
    node.heritageClauses.forEach((clause: any) => {
      clause.types.forEach((type: any) => {
        classDoc.superclass = {
          "name": type.expression.getText()
        }
      })
    })
  }

  if(node.members && node.members.length > 0) {
    classDoc.members = [];
    const gettersAndSetters: string[] = [];

    node.members.forEach((member: any) => {
      if (ts.isPropertyDeclaration(member) || ts.isGetAccessor(member) || ts.isSetAccessor(member)) {
        if(member.name.getText() === 'observedAttributes') {
          return;
        }

        const classMember: ClassMember = {
          kind: 'field',
          name: member.name.getText()
        }

        if(gettersAndSetters.includes(member.name.getText())) {
          return;
        } else {
          gettersAndSetters.push(member.name.getText());
        }

        if(typeof (member as any).initializer !== 'undefined') {
          switch((member as any).initializer.kind) {
            case ts.SyntaxKind.NumericLiteral:
              classMember.type = { type: "number"};
              break;
            case ts.SyntaxKind.StringLiteral:
              classMember.type = { type: "string"};
              break;
            case ts.SyntaxKind.ArrayLiteralExpression:
              classMember.type = { type: "array"};
              break;
            case ts.SyntaxKind.ObjectLiteralExpression:
              classMember.type = { type: "object"};
              break;
            case ts.SyntaxKind.FunctionExpression:
              classMember.type = { type: "function"};
              break;
          }
        }
        if(typeof member.modifiers === 'undefined') {
          classMember.privacy = "public";

          (member as any).jsDoc && (member as any).jsDoc.forEach((jsDoc: any) => {
            jsDoc.tags && jsDoc.tags.forEach((tag: any) => {
              switch(tag.kind) {
                case ts.SyntaxKind.JSDocPublicTag:
                  classMember.privacy = "public";
                  break;
                case ts.SyntaxKind.JSDocPrivateTag:
                  classMember.privacy = "private";
                  break;
                case ts.SyntaxKind.JSDocProtectedTag:
                  classMember.privacy = "protected";
                  break;
              }
            });
          });

        } else {
          member.modifiers.forEach((modifier) => {
            switch(modifier.kind) {
              case ts.SyntaxKind.StaticKeyword:
                classMember.static = true;
                // eslint-disable-next-line
              case ts.SyntaxKind.PublicKeyword:
                classMember.privacy = "public";
                break;
              case ts.SyntaxKind.PrivateKeyword:
                classMember.privacy = "private";
                break;
              case ts.SyntaxKind.ProtectedKeyword:
                classMember.privacy = "protected";
                break;
            }
          });
        }

        if (ts.isPrivateIdentifier(member.name)) {
          classMember.privacy = "private";
        }

        if(typeof (member as any).initializer !== 'undefined') {
          classMember.default = (member as any).initializer.getText();
        }

        classDoc.members!.push(classMember);
      }
    })

    classDoc.members.forEach((member) => {
      visit(node, member)
    });
  }

  if(classDoc.members && classDoc.members!.length === 0) {
    delete classDoc.members;
  }

  moduleDoc.declarations.push(classDoc);
}

function visit(source: ts.SourceFile, member: any) {
  visitNode(source);

  function visitNode(node: any) {
    switch (node.kind) {
      case ts.SyntaxKind.Constructor:
        node.body.statements
          .filter((statement: any) => statement.kind === ts.SyntaxKind.ExpressionStatement)
          .filter((statement: any) => statement.expression.kind === ts.SyntaxKind.BinaryExpression)
          .forEach((statement: any) => {
            if(statement.expression.left.name.getText() === member.name) {
              member.default = statement.expression.right.getText();
            }
          });
        break;
    }

    ts.forEachChild(node, visitNode);
  }
}