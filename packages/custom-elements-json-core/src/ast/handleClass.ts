import ts from 'typescript';
import { handleEvents } from './handleEvents';
import { handleAttributes } from './handleAttributes';
import { ClassMember, CustomElement, JavaScriptModule, Reference, ClassMethod, Attribute, MixinDeclaration } from 'custom-elements-json/schema';
import { extractJsDoc } from '../utils/extractJsDoc';


function hasModifiers(node: any): boolean {
  return Array.isArray(node.modifiers) && node.modifiers.length > 0;
}

function hasJsDoc(node: any): boolean {
  return Array.isArray(node.jsDoc) && node.jsDoc.length > 0;
}

function hasStaticKeyword(node: any): boolean {
  return !!node?.modifiers?.find((mod: any) => mod.kind === ts.SyntaxKind.StaticKeyword);
}

function isAlsoProperty(node: any) {
  let result = true;
  ((node.initializer as ts.ObjectLiteralExpression) || node).properties.forEach((property: any) => {
    if((property.name as ts.Identifier).text === 'attribute' && property.initializer.kind === ts.SyntaxKind.FalseKeyword) {
      result = false;
    }
  })
  return result;
}

function getAttrName(node: any): string | undefined {
  let result = undefined;
  ((node.initializer as ts.ObjectLiteralExpression) || node).properties.forEach((property: any) => {
    if((property.name as ts.Identifier).text === 'attribute' && property.initializer.kind !== ts.SyntaxKind.FalseKeyword) {
      result = property.initializer.text;
    }
  })
  return result;
}

function getReturnVal(node: any) {
  if(ts.isGetAccessor(node)) {
    return (node.body!.statements.find((statement: any) => statement.kind === ts.SyntaxKind.ReturnStatement) as ts.ReturnStatement).expression;
  } else {
    return node.initializer;
  }
}

function alreadyHasAttributes(doc: CustomElement): boolean {
  return Array.isArray(doc.attributes);
}

function hasPropertyDecorator(node: ts.PropertyDeclaration | ts.GetAccessorDeclaration | ts.SetAccessorDeclaration): boolean {
  return Array.isArray(node.decorators) &&
    node.decorators.length > 0 &&
    node.decorators.some((decorator: ts.Decorator) => ts.isDecorator(decorator));
}

export function handleClass(node: any, moduleDoc: JavaScriptModule, kind: 'class'|'mixin') {

  // console.log(node.name);
  const classDoc: any = {
    "kind": kind,
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
          name: jsDoc.name === '-' ? '' : jsDoc.name,
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

  if(node.heritageClauses?.length > 0) {
    node.heritageClauses.forEach((clause: any) => {
      clause.types.forEach((type: any) => {
        const mixins: Reference[] = [];
        let node = type.expression;
        let superClass;

        // gather mixin calls
        if(ts.isCallExpression(node)) {
          mixins.push({ name: node.expression.getText() });
          while(ts.isCallExpression(node.arguments[0])) {
            mixins.push({ name: node.arguments[0].expression.getText() });
            node = node.arguments[0];
          }
          superClass = node.arguments[0].text;
        } else {
          superClass = node.text;
        }

        if(mixins.length > 0 ) {
          classDoc.mixins = mixins;
        }

        classDoc.superclass = {
          "name": superClass,
        }
      })
    })
  }

  if(node.members && node.members.length > 0) {
    classDoc.members = [];
    const gettersAndSetters: string[] = [];
    const methodDenyList = ['connectedCallback', 'disconnectedCallback', 'attributeChangedCallback', 'adoptedCallback', 'requestUpdate', 'performUpdate', 'shouldUpdate', 'update', 'updated', 'render', 'firstUpdated', 'updateComplete'];

    /**
     * CLASS METHODS
     */
    node.members.forEach((member: any) => {
      /**
       * kind method
       * static
       * private
       * inherited from
       * name
       * summary
       * description
       * parameters
       * return
       *    type
       *    description
      */
      if(ts.isMethodDeclaration(member)) {
        if(methodDenyList.includes((member.name as ts.Identifier).text)) {
          return;
        }

        const method: ClassMethod = {
          kind: 'method',
          name:''
        }

        if(hasModifiers(member)) {
          member.modifiers!.forEach(modifier => {
            switch(modifier.kind) {
              case ts.SyntaxKind.StaticKeyword:
                method.static = true;
                // eslint-disable-next-line
              case ts.SyntaxKind.PublicKeyword:
                method.privacy = 'public'
                break;
              case ts.SyntaxKind.PrivateKeyword:
                method.privacy = 'private'
                break;
              case ts.SyntaxKind.ProtectedKeyword:
                method.privacy = 'protected'
                break;
            }
          });
        }

        if(ts.isPrivateIdentifier(member.name)) {
          method.privacy = 'private';
        }

        if(hasJsDoc(member)) {
          const jsDoc = extractJsDoc(member);
          jsDoc.forEach(jsDoc => {
            switch(jsDoc.tag) {
              case 'public':
                method.privacy = 'public';
                break;
              case 'private':
                method.privacy = 'private';
                break;
              case 'protected':
                method.privacy = 'protected';
                break;
            }
          });
        }

        method.name = (member.name as ts.Identifier).text;

        classDoc.members!.push(method);
      }

      if (ts.isPropertyDeclaration(member) || ts.isGetAccessor(member) || ts.isSetAccessor(member)) {

        const memberDenyList = ['styles', 'observedAttributes'];

        // LitElement properties
        if(hasStaticKeyword(member)) {
          if(memberDenyList.includes((member.name as ts.Identifier).text)) {
            return;
          }

          if((member.name as ts.Identifier).text === 'properties') {
            const returnVal = getReturnVal(member);
            returnVal.properties.forEach((property: ts.PropertyAssignment) => {
              const classMember: ClassMember = {
                kind: 'field',
                name: property.name.getText(),
                privacy: 'public',
              }

              if(isAlsoProperty(property)) {
                const attribute: Attribute = {
                  name: getAttrName(property) || property.name.getText(),
                  fieldName: property.name.getText()
                }

                if(alreadyHasAttributes(classDoc)) {
                  classDoc.attributes!.push(attribute);
                } else {
                  classDoc.attributes = [attribute]
                }
              }

              classDoc.members!.push(classMember);
            });
            return;
          }
        }

        const classMember: ClassMember = {
          kind: 'field',
          name: member.name.getText()
        }

        // LitElement `@property` decorator
        if(hasPropertyDecorator(member)) {
          const propertyDecorator = member.decorators!.find((decorator: any) => decorator.expression.expression.text === 'property');
          const propertyOptions = (propertyDecorator as any).expression.arguments.find((arg: ts.ObjectLiteralExpression) => ts.isObjectLiteralExpression(arg));

          if(isAlsoProperty(propertyOptions)) {
            const attribute: Attribute = {
              name: getAttrName(propertyOptions) || member.name.getText(),
              fieldName: member.name.getText()
            }

            if(alreadyHasAttributes(classDoc)) {
              classDoc.attributes!.push(attribute);
            } else {
              classDoc.attributes = [attribute]
            }
          }
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
    });

    classDoc.members.forEach((member: any) => {
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
            // @TODO get jsdoc types
            if(statement.expression.left.name.getText() === member.name) {
              member.default = statement.expression.right.getText();
            }
          });
        break;
    }

    ts.forEachChild(node, visitNode);
  }
}