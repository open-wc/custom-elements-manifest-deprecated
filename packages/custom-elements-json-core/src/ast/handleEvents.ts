import ts, { isVariableDeclaration, isIdentifier, isCallExpression } from 'typescript';
import { Event, CustomElement } from 'custom-elements-json/schema';
import { customElementsJson } from '../customElementsJson';
import { extractJsDoc } from '../utils/extractJsDoc';

export function handleEvents(node: any, classDoc: CustomElement) {
  const events: Event[] = [];
  classDoc.events = [];

  node.members &&
    node.members.forEach((member: ts.MemberExpression) => {
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
            type: { type: jsDoc.type || 'Event' },
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
        if (node.expression.name.getText() === 'dispatchEvent') {
          const eventDoc: Event = {
            name: '',
            type: {
              type: '',
            },
          };

          node.arguments.forEach((arg: any) => {
            if (arg.kind === ts.SyntaxKind.NewExpression) {
              // @TODO
              // if the type of event is not Event or CustomEvent, find a reference to the type
              eventDoc.name = arg.arguments[0].text;
              eventDoc.type = { type: arg.expression.text };
              events.push(eventDoc);
            }

            if (isIdentifier(arg)) {
              customElementsJson.visitCurrentModule(node => {
                if (isIdentifier(node)) {
                  if (isVariableDeclaration(node.parent)) {
                    if (node.getText() === arg.getText()) {
                      const initializer = node?.parent?.initializer;
                      if (initializer && isCallExpression(initializer)) {
                        // TODO: I didn't want to type this as any.
                        // But I think you might've made some assumptions
                        // that I don't understand by reading this code.
                        const firstArg = initializer.arguments?.[0] as any;
                        eventDoc.name = firstArg.text;
                        eventDoc.type = { type: initializer.expression?.getText() };
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
