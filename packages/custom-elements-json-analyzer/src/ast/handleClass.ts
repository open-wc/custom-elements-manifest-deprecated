import ts from 'typescript';
import { handleEvents } from './handleEvents';
import { handleAttributes } from './handleAttributes';
import {
  ClassMember,
  JavaScriptModule,
  Reference,
  ClassMethod,
  Attribute,
} from '../schema';
import { extractJsDoc } from '../utils/extractJsDoc';
import { handleParamsAndReturnType } from '../ast/handleFunctionlike';
import {
  hasModifiers,
  hasJsDoc,
  hasStaticKeyword,
  isAlsoProperty,
  getAttrName,
  getReturnVal,
  alreadyHasAttributes,
  hasPropertyDecorator,
  mergeJsDocWithPropAndPush,
  isValidArray,
  pushSafe,
} from '../utils';
import { customElementsJson } from '../customElementsJson';
import path from 'path';
import { handleCustomElementsDefine } from './handleCustomElementsDefine';

interface Mixin {
  name: string,
  package?: string,
  module?: string
}

function mergeAttributes(propertyOptions: any, member: any, classDoc: any) {
  const attrName = getAttrName(propertyOptions) || member.name.getText();
            
  let alreadyExistingAttribute = classDoc?.attributes?.find((attr: Attribute) => attr.name === attrName);
  if(alreadyExistingAttribute) {
    alreadyExistingAttribute = {
      ...alreadyExistingAttribute,
      ...{
        name: attrName,
        fieldName: member.name.getText(),
      }
    }

    const type = member?.type?.getText();
    const hasType = !!type;
    if(hasType) {
      alreadyExistingAttribute.type = { type };
    } else {
      const type = propertyOptions?.properties?.find((property: any) => {
        return property?.name?.text === 'type';
      })?.initializer?.getText()?.toLowerCase();

      alreadyExistingAttribute.type = { type };

    }

    const attrIndex = classDoc?.attributes?.findIndex((attr: Attribute) => attr.name === attrName);
    classDoc.attributes[attrIndex] = alreadyExistingAttribute;

  } else {
    const attribute: Attribute = {
      name: attrName,
      fieldName: member.name.getText(),
    };

    if (alreadyHasAttributes(classDoc)) {
      classDoc.attributes!.push(attribute);
    } else {
      classDoc.attributes = [attribute];
    }
  }
}

function createMixin(name: string): Mixin {
  const mixin: Mixin = {
    name
  };
  const currentModulePath = customElementsJson.currentModule.fileName;

  const foundMixin = isValidArray(customElementsJson.imports) && customElementsJson.imports.find((_import: any) => {
    return _import.name === name;
  });

  if(foundMixin) {
    // Mixin is imported from bare module specifier
    if (foundMixin.importPath && foundMixin.isBareModuleSpecifier) {
      mixin.package = foundMixin.importPath;
    }
  
    // Mixin is imported from a different local module
    if (foundMixin.importPath && !foundMixin.isBareModuleSpecifier) {
      mixin.module = path.resolve(path.dirname(currentModulePath), foundMixin.importPath).replace(process.cwd(), '');
    }
  
    // Mixin was found in the current modules declarations, so defined locally
    if (!foundMixin.importPath) {
      mixin.module = currentModulePath;
    }
  }
  return mixin;
}

export function handleClass(node: any, moduleDoc: JavaScriptModule, kind: 'class' | 'mixin', _classDoc: any = {
  kind: '',
  description: '',
  name: '',
  cssProperties: [],
  cssParts: [],
  slots: [],
  members: []
}) {

  const classDoc = _classDoc;
  classDoc.kind = kind;
  classDoc.name = node.name?.getText() || node?.parent?.parent?.name?.getText() || 'anonymous class';

  if(isValidArray(node.decorators)) {
    const customElementDecorator = node.decorators?.find((decorator: ts.Decorator) => {
      return (decorator.expression as any).expression.getText() === 'customElement';
    }).expression;
    handleCustomElementsDefine(customElementDecorator, moduleDoc);
  }

  /** Extract cssProperties, cssParts and slots from JSdoc, if any */
  const jsDocs = extractJsDoc(node);
  if (Array.isArray(jsDocs) && jsDocs.length > 0) {
    jsDocs
      .filter(jsDoc => jsDoc.tag === 'cssprop' || jsDoc.tag === 'cssproperty')
      .forEach(jsDoc => {
        classDoc.cssProperties.push({
          name: jsDoc.name,
          description: jsDoc.description.replace('- ', ''),
        });
      });

    jsDocs
      .filter(jsDoc => jsDoc.tag === 'prop' || jsDoc.tag === 'property')
      .forEach(jsDoc => {
        classDoc.members.push({
          name: jsDoc.name,
          type: { type: jsDoc.type },
          description: jsDoc.description.replace('- ', ''),
        });
      });

    jsDocs
      .filter(jsDoc => jsDoc.tag === 'csspart')
      .forEach(jsDoc => {
        classDoc.parts.push({
          name: jsDoc.name,
          description: jsDoc.description.replace('- ', ''),
        });
      });

    jsDocs
      .filter(jsDoc => jsDoc.tag === 'slot')
      .forEach(jsDoc => {
        classDoc.slots.push({
          name: jsDoc.name === '-' ? '' : jsDoc.name,
          description: jsDoc.description.replace('- ', ''),
        });
      });
  }

  if (classDoc.cssProperties && classDoc.cssProperties.length === 0) {
    delete classDoc.cssProperties;
  }

  if (classDoc.parts && classDoc.parts.length === 0) {
    delete classDoc.parts;
  }

  if (classDoc.slots && classDoc.slots.length === 0) {
    delete classDoc.slots;
  }

  if (classDoc.members && classDoc.members.length === 0) {
    delete classDoc.members;
  }

  if(!classDoc.description) {
    delete classDoc.description;
  }

  handleAttributes(node, classDoc);
  handleEvents(node, classDoc);

  if (node.heritageClauses?.length > 0) {
    node.heritageClauses.forEach((clause: any) => {
      clause.types.forEach((type: any) => {
        const mixins: Reference[] = [];
        let node = type.expression;
        let superClass: string;

        // gather mixin calls
        if (ts.isCallExpression(node)) {
          const mixinName = node.expression.getText();
          mixins.push(createMixin(mixinName))
          while (ts.isCallExpression(node.arguments[0])) {
            node = node.arguments[0];
            const mixinName = node.expression.getText();
            mixins.push(createMixin(mixinName));
          }
          superClass = node.arguments[0].text;
        } else {
          superClass = node.text;
        }

        if (mixins.length > 0) {
          classDoc.mixins = mixins;
        }

        classDoc.superclass = {
          name: superClass,
        };

        const foundSuperClass = isValidArray(customElementsJson.imports) && customElementsJson.imports.find((_import: any) => {
          return _import.name === superClass;
        });
    
        // superclass is imported from another file
        if(foundSuperClass) {
          // superclass is from 3rd party package
          if(foundSuperClass.isBareModuleSpecifier) {
            classDoc.superclass.package = foundSuperClass.importPath;
          } else {
            // superclass is imported from a local module
            classDoc.superclass.module = path.resolve(path.dirname(moduleDoc.path), foundSuperClass.importPath).replace(process.cwd(), '');
          }
        } else {
          classDoc.superclass.module = moduleDoc.path;
        }

        if(superClass === 'HTMLElement') {
          delete classDoc.superclass.module;
        }
      });
    });
  }

  if (node.members && node.members.length > 0) {
    const gettersAndSetters: string[] = [];
    const methodDenyList = [
      'connectedCallback',
      'disconnectedCallback',
      'attributeChangedCallback',
      'adoptedCallback',
      'requestUpdate',
      'performUpdate',
      'shouldUpdate',
      'update',
      'updated',
      'render',
      'firstUpdated',
      'updateComplete',
    ];

    /**
     * CLASS METHODS
     */
    node.members.forEach((member: any) => {
      if (ts.isMethodDeclaration(member)) {
        if (methodDenyList.includes((member.name as ts.Identifier).text) && classDoc.superclass?.name === 'LitElement') {
          return;
        }

        let method: ClassMethod = {
          kind: 'method',
          name: '',
          privacy: 'public'
        };

        if (hasModifiers(member)) {
          member.modifiers!.forEach(modifier => {
            switch (modifier.kind) {
              case ts.SyntaxKind.StaticKeyword:
                method.static = true;
              // eslint-disable-next-line
              case ts.SyntaxKind.PublicKeyword:
                method.privacy = 'public';
                break;
              case ts.SyntaxKind.PrivateKeyword:
                method.privacy = 'private';
                break;
              case ts.SyntaxKind.ProtectedKeyword:
                method.privacy = 'protected';
                break;
            }
          });
        }

        if (ts.isPrivateIdentifier(member.name)) {
          method.privacy = 'private';
        }

        if (hasJsDoc(member)) {
          const jsDoc = extractJsDoc(member);
          jsDoc.forEach((jsDoc: any) => {
            switch (jsDoc.tag) {
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
        method = handleParamsAndReturnType(method, member);

        classDoc.members = pushSafe(classDoc.members, method);
      }

      if (
        ts.isPropertyDeclaration(member) ||
        ts.isGetAccessor(member) ||
        ts.isSetAccessor(member)
      ) {
        const memberDenyList = ['styles', 'observedAttributes'];

        // LitElement properties
        if (hasStaticKeyword(member)) {
          if (memberDenyList.includes((member.name as ts.Identifier).text)) {
            return;
          }

          if ((member.name as ts.Identifier).text === 'properties') {
            const returnVal = getReturnVal(member);
            returnVal?.properties?.forEach((property: ts.PropertyAssignment) => {
              if(!property.name) return;
              const classMember: ClassMember = {
                kind: 'field',
                name: property.name.getText(),
                privacy: 'public',
              };

              if (isAlsoProperty(property)) {
                const propertyOptions = property.initializer;
                mergeAttributes(propertyOptions, property, classDoc);
              }

              mergeJsDocWithPropAndPush(classDoc, classMember);
            });
            return;
          }
        }

        const classMember: ClassMember = {
          kind: 'field',
          name: member.name.getText(),
        };

        // LitElement `@property` decorator
        if (hasPropertyDecorator(member)) {
          const propertyDecorator = member.decorators!.find(
            (decorator: any) => decorator.expression.expression.text === 'property',
          );
          const propertyOptions = (propertyDecorator as any)?.expression?.arguments.find(
            (arg: ts.ObjectLiteralExpression) => ts.isObjectLiteralExpression(arg),
          );

          if (isAlsoProperty(propertyOptions)) {
            mergeAttributes(propertyOptions, member, classDoc);
          }
        }

        if (gettersAndSetters.includes(member.name.getText())) {
          return;
        } else {
          gettersAndSetters.push(member.name.getText());
        }

        if (typeof (member as any).initializer !== 'undefined') {
          switch ((member as any).initializer.kind) {
            case ts.SyntaxKind.NumericLiteral:
              classMember.type = { type: 'number' };
              break;
            case ts.SyntaxKind.StringLiteral:
              classMember.type = { type: 'string' };
              break;
            case ts.SyntaxKind.ArrayLiteralExpression:
              classMember.type = { type: 'array' };
              break;
            case ts.SyntaxKind.ObjectLiteralExpression:
              classMember.type = { type: 'object' };
              break;
            case ts.SyntaxKind.FunctionExpression:
              classMember.type = { type: 'function' };
              break;
          }
        }
        if (typeof member.modifiers === 'undefined') {
          classMember.privacy = 'public';

          (member as any).jsDoc &&
            (member as any).jsDoc.forEach((jsDoc: any) => {
              jsDoc.tags &&
                jsDoc.tags.forEach((tag: any) => {
                  switch (tag.kind) {
                    case ts.SyntaxKind.JSDocPublicTag:
                      classMember.privacy = 'public';
                      break;
                    case ts.SyntaxKind.JSDocPrivateTag:
                      classMember.privacy = 'private';
                      break;
                    case ts.SyntaxKind.JSDocProtectedTag:
                      classMember.privacy = 'protected';
                      break;
                  }
                });
            });
        } else {
          member.modifiers.forEach(modifier => {
            switch (modifier.kind) {
              case ts.SyntaxKind.StaticKeyword:
                classMember.static = true;
              // eslint-disable-next-line
              case ts.SyntaxKind.PublicKeyword:
                classMember.privacy = 'public';
                break;
              case ts.SyntaxKind.PrivateKeyword:
                classMember.privacy = 'private';
                break;
              case ts.SyntaxKind.ProtectedKeyword:
                classMember.privacy = 'protected';
                break;
            }
          });
        }

        const jsDoc = extractJsDoc(member);
        jsDoc?.forEach((jsDoc: any) => {

          if(jsDoc.tag === 'type') {
            classMember.type = { type: jsDoc.type }
            if(jsDoc.description) {
              classMember.description = jsDoc.description.replace('- ', '');
            }
          }

          if(jsDoc.tag === 'public')
          switch(jsDoc.tag) {
            case 'public':
              classMember.privacy = 'public';
              break;
            case 'private':
              classMember.privacy = 'private';
              break;
            case 'protected':
              classMember.privacy = 'protected';
              break;
          }
        });

        if (ts.isPrivateIdentifier(member.name)) {
          classMember.privacy = 'private';
        }

        /** Add TS type to field, if present */
        if(member.type) {
          classMember.type = { type: member.type.getText() }
        }

        if (
          typeof (member as any).initializer !== 'undefined' && 
          !ts.isCallExpression((member as any).initializer) && 
          !ts.isArrowFunction((member as any).initializer)
        ) {
          classMember.default = (member as any).initializer.getText();
        }

        /** If prop already exists as a JSDoc comment, merge */
        mergeJsDocWithPropAndPush(classDoc, classMember);
      }
    });

    classDoc.members?.forEach((member: any) => {
      visit(node, member);
    });
  }

  if (classDoc.members && classDoc.members!.length === 0) {
    delete classDoc.members;
  }

  moduleDoc.declarations.push(classDoc);
}

function visit(source: ts.SourceFile, member: any) {
  visitNode(source);

  function visitNode(node: any) {
    switch (node.kind) {
      case ts.SyntaxKind.Constructor:
        node.body?.statements?.filter((statement: any) => statement.kind === ts.SyntaxKind.ExpressionStatement)
          .filter((statement: any) => statement.expression.kind === ts.SyntaxKind.BinaryExpression)
          .forEach((statement: any) => {
            if (
              statement.expression?.left?.name?.getText() === member.name &&
              member.kind === 'field'
            ) {
              /** If a assignment in the constructor has jsdoc types or descriptions, get them and add them */
              const jsDocs = extractJsDoc(statement);
              if (isValidArray(jsDocs)) {
                jsDocs.forEach((doc: any) => {
                    if(doc.tag === 'type' && !member.type) {
                      member.type = { type: doc.type.replace(/import(.*)\./, '') };
                    }
                    if('description' in doc && doc.description !== '') {
                      member.description = doc.description;
                    }
                  });
              }

              if(
                !ts.isCallExpression(statement.expression.right) && 
                !ts.isArrowFunction(statement.expression.right)
              ) {
                member.default = statement.expression.right.getText();
              }
            }
          });
        break;
    }

    ts.forEachChild(node, visitNode);
  }
}
