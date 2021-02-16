const ts = require('typescript');
const parse = require('comment-parser');

const findDecorator = type => decorator => decorator?.expression?.expression?.getText() === type;
const hasStaticKeyword = node => !!node?.modifiers?.find(mod => mod.kind === ts.SyntaxKind.StaticKeyword);

function getReturnVal(node) {
  if (ts.isGetAccessor(node)) {
    return node.body?.statements?.find(
      (statement) => statement.kind === ts.SyntaxKind.ReturnStatement,
    )?.expression;
  } else {
    return node.initializer;
  }
}

function getAttrName(node) {
  let result = undefined;
  (node?.initializer || node)?.properties?.forEach((property) => {
    if (
      property.name.text === 'attribute' &&
      property.initializer.kind !== ts.SyntaxKind.FalseKeyword
    ) {
      result = property.initializer.text;
    }
  });
  return result;
}

function isAlsoProperty(node) {
  let result = true;
  (node?.initializer || node)?.properties?.forEach((property) => {
    if (
      property.name.text === 'attribute' &&
      property.initializer.kind === ts.SyntaxKind.FalseKeyword
    ) {
      result = false;
    }
  });
  return result;
}

function mergeAttributes(propertyOptions, member, classDoc) {
  const attrName = getAttrName(propertyOptions) || member.name.getText();
            
  let alreadyExistingAttribute = classDoc?.attributes?.find((attr) => attr.name === attrName);
  if(alreadyExistingAttribute) {
    alreadyExistingAttribute = {
      ...alreadyExistingAttribute,
      ...{
        name: attrName,
        fieldName: member.name.getText(),
      }
    }

    const text = member?.type?.getText();
    const hasType = !!text;
    if(hasType) {
      alreadyExistingAttribute.type = { text };
    } else {
      const text = propertyOptions?.properties?.find((property) => {
        return property?.name?.text === 'type';
      })?.initializer?.getText()?.toLowerCase();

      alreadyExistingAttribute.type = { text };

    }

    const attrIndex = classDoc?.attributes?.findIndex((attr) => attr.name === attrName);
    classDoc.attributes[attrIndex] = alreadyExistingAttribute;

  } else {
    const attribute = {
      name: attrName,
      fieldName: member.name.getText(),
    };

    if (alreadyHasAttributes(classDoc)) {
      classDoc.attributes.push(attribute);
    } else {
      classDoc.attributes = [attribute];
    }
  }
}

function mergeJsDocWithPropAndPush(classDoc, classMember) {
  const prop = classDoc.members?.find((member) => member.name === classMember.name);
  const propAlreadyExists = prop !== undefined;
  if (propAlreadyExists) {
    Object.assign(prop, classMember);
  } else {
    classDoc.members = pushSafe(classDoc.members, classMember);
  }
}

function alreadyHasAttributes(doc) {
  return isValidArray(doc.attributes);
}

function isValidArray(array) {
  return Array.isArray(array) && array.length > 0;
}

function pushSafe(array, item) {
  if (isValidArray(array)) {
    array.push(item);
  } else {
    array = [item];
  }
  return array;
}

function hasPropertyDecorator(node) {
  return (
    isValidArray(node.decorators) &&
    node.decorators.some((decorator) => { 
      return ts.isDecorator(decorator) && decorator.expression.expression.getText() === 'property'
    })
  );
}

function extractImportType(jsDoc) {
  if(jsDoc.type && jsDoc.type.match(/import(.*)\./)) {
    jsDoc.type = jsDoc.type.replace(/import(.*)\./, '');
  }
  return jsDoc;
}

function extractJsDoc(node) {
  const result = [];
  if (Array.isArray(node.jsDoc) && node.jsDoc.length > 0) {
    // only get the jsdoc thats directly above the node
    const jsDoc = node.jsDoc[node.jsDoc.length - 1];

    const res = parse(jsDoc.getText())[0];
    if(res) {
      res.tags.forEach((tag) => {
        tag = extractImportType(tag);
        result.push(tag);
      });

      if(res.description) {
        result.push({ description: res.description });
      }
    }
    return result;
  }
  return [];
}


function visit(source, member) {
  visitNode(source);

  function visitNode(node) {
    switch (node.kind) {
      case ts.SyntaxKind.Constructor:
        node.body?.statements?.filter((statement) => statement.kind === ts.SyntaxKind.ExpressionStatement)
          .filter((statement) => statement.expression.kind === ts.SyntaxKind.BinaryExpression)
          .forEach((statement) => {
            if (
              statement.expression?.left?.name?.getText() === member.name &&
              member.kind === 'field'
            ) {
              /** If a assignment in the constructor has jsdoc types or descriptions, get them and add them */
              const jsDocs = extractJsDoc(statement);
              if (isValidArray(jsDocs)) {
                jsDocs.forEach((doc) => {
                    if(doc.tag === 'type' && !member.type) {
                      member.type = { text: doc.type.replace(/import(.*)\./, '') };
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


module.exports = function lit() {
  const METHOD_DENYLIST = ['requestUpdate', 'performUpdate', 'shouldUpdate', 'update', 'render', 'firstUpdated', 'updated'];
  const PROPERTY_DENYLIST = ['styles', 'properties'];

  return {
    // Runs for each module
    analyzePhase({node, moduleDoc}){
      switch (node.kind) {
        case ts.SyntaxKind.ClassDeclaration:

          const className = node?.name?.getText();
          const currClass = moduleDoc?.declarations?.find(declaration => declaration.name === className);

          /**
           * Handle `@customElement('my-element') decorator
           */
          const customElementDecorator = node?.decorators?.find(findDecorator('customElement'))?.expression;
          const tagName = customElementDecorator?.arguments?.[0]?.text;
          
          if(tagName) {
            currClass.tagName = tagName;
            moduleDoc.exports.push({
              kind: "custom-element-definition",
              name: tagName,
              declaration: {
                name: className,
                module: moduleDoc.path
              }
            });
          }

          node?.members?.forEach(member => {
            if (hasPropertyDecorator(member)) {
              const propertyDecorator = member.decorators.find(
                (decorator) => decorator.expression.expression.text === 'property',
              );
              const propertyOptions = propertyDecorator?.expression?.arguments.find(
                (arg) => ts.isObjectLiteralExpression(arg),
              );

              if (isAlsoProperty(propertyOptions)) {
                mergeAttributes(propertyOptions, member, currClass);
              }
            }

            if (hasStaticKeyword(member)) {

              if (member.name.text === 'properties') {
                const returnVal = getReturnVal(member);
                returnVal?.properties?.forEach(property => {
                  if(!property.name) return;
                  const classMember = {
                    kind: 'field',
                    name: property.name.getText(),
                    privacy: 'public',
                  };

                  if (isAlsoProperty(property)) {
                    const propertyOptions = property.initializer;
                    mergeAttributes(propertyOptions, property, currClass);
                  }

                  mergeJsDocWithPropAndPush(currClass, classMember);
                });
                return;
              }
            }
          });

          currClass?.members?.forEach((member) => {
            visit(node, member);
          });
          break;
      }
    },
    // Runs for each module, after analyzing, all information about your module should now be available
    moduleLinkPhase({moduleDoc}){
      /**
       * Remove lifecycle methods and `static styles` and `static properties`
       */ 
      const classes = moduleDoc?.declarations?.filter(declaration => declaration.kind === 'class');

      classes?.forEach(klass => {
        if(!klass?.members) return;
        klass.members = klass?.members?.filter(member => !METHOD_DENYLIST.includes(member.name));
        klass.members = klass?.members?.filter(member => !PROPERTY_DENYLIST.includes(member.name));
      });
    },
    // Runs after modules have been parsed
    packageLinkPhase(customElementsManifest){},
  }
}
