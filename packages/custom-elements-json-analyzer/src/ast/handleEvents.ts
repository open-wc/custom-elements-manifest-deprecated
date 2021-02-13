import ts from 'typescript';
import { Event, CustomElement } from 'custom-elements-manifest/schema';
import { customElementsJson } from '../customElementsJson';
import { extractJsDoc } from '../utils/extractJsDoc';
import { isValidArray } from '../utils';

export function handleEvents(node: any, classDoc: CustomElement) {
  const events: Event[] = [];
  classDoc.events = [];

  node.members?.forEach((member: ts.MemberExpression) => {
    if (ts.isMethodDeclaration(member)) {
      visit(member, events);
    }
  });

  /** Extract events from JSdoc, if any */
  const jsDocs = extractJsDoc(node);
  if (Array.isArray(jsDocs) && jsDocs.length > 0) {
    jsDocs
      .filter(jsDoc => jsDoc.tag === 'fires' || jsDoc.tag === 'event')
      .forEach(jsDoc => {
        const existingEvent = events.find(event => event.name === jsDoc.name);
        if (existingEvent) {
          // event already exists, add the jsdoc description to it
          existingEvent.description = jsDoc.description.replace('- ', '');
        } else {
          // event doesnt exist, add it
          events.push({
            name: jsDoc.name,
            type: { text: jsDoc.type || 'Event' },
            description: jsDoc.description.replace('- ', ''),
          });
        }
      });
  }

  if (events.length === 0) {
    delete classDoc.events;
  } else {
    classDoc.events = events;
  }
}

function visit(source: any, events: Event[]) {
  visitNode(source);

  function visitNode(node: any) {
    switch (node.kind) {
      case ts.SyntaxKind.CallExpression:

        // if callexpression is `this.dispatchEvent`
        if (node.expression?.name?.getText() === 'dispatchEvent' && node.expression.expression.kind === ts.SyntaxKind.ThisKeyword) {

          const eventDoc: Event = {
            name: '',
            type: {
              text: '',
            },
          };

          const jsDoc = extractJsDoc(node.parent);

          if(isValidArray(jsDoc)) {
            jsDoc.forEach((doc: any) => {
              if(doc.tag === 'type') {
                if(doc.type && doc.type !== '') {
                  eventDoc.type = { text: doc.type.replace(/import(.*)\./, '') };
                }
                if(doc.name && doc.name !== '') {
                  eventDoc.name = doc.name;
                }
              }
              if(doc.description && doc.description !== '') {
                eventDoc.description = doc.description.replace('- ', '');
              }
            });
          }


          node.arguments.forEach((arg: any) => {
            if (arg.kind === ts.SyntaxKind.NewExpression) {
              eventDoc.name = arg.arguments[0].text;

              if(eventDoc.type.text === '') {
                eventDoc.type = { text: arg.expression.text };
              }
              const existingEvent = events.find(event => event.name === eventDoc.name);
              if(!existingEvent) {
                events.push(eventDoc);
              }
            }

            if (arg.kind === ts.SyntaxKind.Identifier) {
              customElementsJson.visitCurrentModule(node => {
                switch (node.kind) {
                  case ts.SyntaxKind.Identifier:
                    if (node.parent.kind === ts.SyntaxKind.VariableDeclaration) {
                      if (node.getText() === arg.getText()) {
                        eventDoc.name = node.parent.initializer.arguments[0].text;
                        eventDoc.type = { text: node.parent.initializer.expression.getText() };
                        const existingEvent = events.find(event => event.name === eventDoc.name);
                        if(!existingEvent) {
                          events.push(eventDoc);
                        }
                      }
                    }
                }
              });
            }
          });
        }
    }

    ts.forEachChild(node, visitNode);
  }
}
