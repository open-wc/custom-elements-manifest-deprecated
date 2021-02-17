# @custom-elements-manifest/analyzer

> ⚠️ This project is still experimental, please try it out in your projects and create issues if you run into any problems

Custom Elements Manifest is a file format that describes custom elements. This format will allow tooling and IDEs to give rich information about the custom elements in a given project. It is, however, very experimental and things are subject to change. Follow the discussion [here](https://github.com/webcomponents/custom-elements-manifest).

This implementation is at a very early stage of development, and there will probably be bugs or things missing from the output `custom-elements.json`. You can help this project by trying it out in your project, and creating an issue if you find anything weird.

## Install

```bash
npm i -D @custom-elements-manifest/analyzer
```

## Usage

```bash
custom-elements-manifest analyze
```

### Options

| Command/option   | Type       | Description                                          | Example               |
| ---------------- | ---------- | ---------------------------------------------------- | --------------------- |
| analyze          |            | Analyze your components                              |                       |
| --globs          | string[]   | Globs to analyze                                     | `--globs "foo.js"`    |
| --exclude        | string[]   | Globs to exclude                                     | `--exclude "!foo.js"` |
| --litelement     | boolean    | Enable special handling for LitElement syntax        | `--litelement`        |
| --stencil        | boolean    | Enable special handling for Stencil syntax           | `--stencil`           |

## Demo

`my-element.js`:

```js
class MyElement extends HTMLElement {
  static get observedAttributes() {
    return ['disabled'];
  }

  set disabled(val) {
    this.__disabled = val;
  }
  get disabled() {
    return this.__disabled;
  }

  fire() {
    this.dispatchEvent(new Event('disabled-changed'));
  }
}
```

`custom-elements.json`:

```JSON
{
  "schemaVersion": "experimental",
  "readme": "",
  "modules": [
    {
      "kind": "javascript-module",
      "path": "./my-element.js",
      "declarations": [
        {
          "kind": "class",
          "name": "MyElement",
          "attributes": [
            {
              "name": "disabled"
            }
          ],
          "events": [
            {
              "name": "disabled-changed",
              "type": {
                "type": "Event"
              }
            }
          ],
          "superclass": {
            "name": "HTMLElement"
          },
          "members": [
            {
              "kind": "field",
              "name": "disabled",
              "privacy": "public"
            },
            {
              "kind": "method",
              "name": "fire",
              "privacy": "public"
            }
          ],
          "tagName": "my-element"
        }
      ],
      "exports": [
        {
          "kind": "custom-element-definition",
          "name": "my-element",
          "declaration": {
            "name": "MyElement",
            "module": "./my-element.js"
          }
        }
      ]
    }
  ]
}
```

### Support

`@custom-elements-manifest/analyzer` by default supports standard JavaScript, and _vanilla_ web components. Dedicated web component libraries can be supported through the use of plugins. Currently, support for LitElement and Stencil is provided in this project via plugins. You can enable them by using the CLI flags `--litelement` and `--stencil` respectively, or loading the plugin via your `custom-elements-manifest.config.js`.

**TL;DR:** 
- Vanilla 
- TS 
- LitElement (via plugin/CLI flag) 
- Stencil (via plugin/CLI flag)

Support for other web component libraries can be done via custom [plugins](#plugins), feel free to create your own for your favourite libraries.

TypeScript is also supported.

### Documenting your components

For all supported syntax, please check the [fixtures](./fixtures) folder.

`@custom-elements-manifest/analyzer` is able to figure out most of your components API by itself, but for some things it needs a little help, including the following: CSS Shadow Parts, CSS Custom Properties and Slots. You can document these using JSDoc.

```js
import { LitElement, html, css } from 'lit-element';

/**
 * @slot container - You can put some elements here
 *
 * @cssprop --text-color - Controls the color of foo
 * @cssproperty --background-color - Controls the color of bar
 *
 * @csspart bar - Styles the color of bar
 */
class MyElement extends LitElement {
  static get styles() {
    return css`
      :host {
        color: var(--text-color, black);
        background-color: var(--background-color, white);
      }
    `;
  }

  static get observedAttributes() {
    return [
      /**
       * @type {boolean} - description
       * @property disabled - corresponding property
       */
      'disabled',
    ];
  }

  constructor() {
    super();
    /** @type {boolean} - disabled state */
    this.disabled = true;
  }

  get disabled() {
    /* etc */
  }
  set disabled(val) {
    /* etc */
  }

  fire() {
    /** @type {FooEvent} foo-event - description */
    this.dispatchEvent(new FooEvent('foo-changed'));
  }

  render() {
    return html`
      <div part="bar"></div>
      <slot name="container"></slot>
    `;
  }
}

/** @type {boolean} - This will show up in the custom-elements.json too */
export const someVariable = true;

customElements.define('my-element', MyElement);
```

<details>
  <summary>
    <code>custom-elements.json</code>:
  </summary>

```json
{
  "schemaVersion": "experimental",
  "readme": "",
  "modules": [
    {
      "kind": "javascript-module",
      "path": "./fixtures/TEST/package/my-el.js",
      "declarations": [
        {
          "kind": "class",
          "name": "MyElement",
          "cssProperties": [
            {
              "name": "--text-color",
              "description": "Controls the color of foo"
            },
            {
              "name": "--background-color",
              "description": "Controls the color of bar"
            }
          ],
          "cssParts": [
            {
              "name": "bar",
              "description": "Styles the color of bar"
            }
          ],
          "slots": [
            {
              "name": "container",
              "description": "You can put some elements here"
            }
          ],
          "attributes": [
            {
              "name": "disabled",
              "type": {
                "type": "boolean"
              },
              "description": "corresponding property",
              "fieldName": "disabled"
            }
          ],
          "events": [
            {
              "name": "foo-changed",
              "type": {
                "type": "FooEvent"
              },
              "description": "description"
            }
          ],
          "superclass": {
            "name": "LitElement",
            "package": "lit-element"
          },
          "members": [
            {
              "kind": "field",
              "name": "disabled",
              "privacy": "public",
              "type": {
                "type": "boolean"
              },
              "description": "disabled state",
              "default": "true"
            },
            {
              "kind": "method",
              "name": "fire",
              "privacy": "public"
            }
          ],
          "tagName": "my-element"
        },
        {
          "kind": "variable",
          "name": "someVariable",
          "description": "This will show up in the custom-elements.json too",
          "type": {
            "type": "boolean"
          }
        }
      ],
      "exports": [
        {
          "kind": "js",
          "name": "someVariable",
          "declaration": {
            "name": "someVariable",
            "module": "./fixtures/TEST/package/my-el.js"
          }
        },
        {
          "kind": "custom-element-definition",
          "name": "my-element",
          "declaration": {
            "name": "MyElement",
            "module": "./fixtures/TEST/package/my-el.js"
          }
        }
      ]
    }
  ]
}
```

</details>

### Supported JSDoc

| JSDoc                         | Description                                        |
| ----------------------------- | -------------------------------------------------- |
| `@attr`, <br>`@attribute`     | Documents attributes for your custom element       |
| `@prop`, <br>`@property `     | Documents properties for your custom element       |
| `@csspart`                    | Documents your custom elements CSS Shadow Parts    |
| `@slot`                       | Documents the Slots used in your components        |
| `@cssprop`,<br>`@cssproperty` | Documents CSS Custom Properties for your component |
| `@fires`,<br>`@event`         | Documents events that your component might fire    |
| `@tag`,<br>`@tagname`         | Documents the name of your custom element          |

```js
/**
 * @attr {boolean} disabled - disables the element
 * @attribute {string} foo - description for foo
 *
 * @csspart bar - Styles the color of bar
 *
 * @slot container - You can put some elements here
 *
 * @cssprop --text-color - Controls the color of foo
 * @cssproperty --background-color - Controls the color of bar
 *
 * @prop {boolean} prop1 - some description
 * @property {number} prop2 - some description
 *
 * @fires custom-event - some description for custom-event
 * @fires {Event} typed-event - some description for typed-event
 * @event {CustomEvent} typed-custom-event - some description for typed-custom-event
 * 
 * @tag my-element
 * @tagname my-element
 */
class MyElement extends HTMLElement {}
```

## Advanced configuration

You can also specify a custom `custom-elements-manifest.config.mjs` configuration file that allows the following properties:

`custom-elements-manifest.config.mjs`:
```js
import myAwesomePlugin from 'awesome-plugin';

export default {
  globs: ['src/**/*.js'], 
  exclude: ['!src/foo.js'], // prefix with a `!` to exclude
  dev: true,
  tsTarget: 2, // sets the tsTarget for typescript

  /* Use if you want to analyze a string of code, for example for the playground API. Both are required in this case */
  path: '',
  sourceCode: '',

  plugins: [myAwesomePlugin()],
}
```

Config types:

```ts
interface userConfigOptions {
  globs: string[],
  exclude: string[],
  dev: boolean,
  tsTarget: number,

  /* Use if you want to analyze a string of code, for example for the playground API. Both are required in this case */
  path: string,
  sourceCode: string,

  plugins: Array<() => Plugin>
}

```

## Plugins

You can also write custom plugins to extend the functionality to fit what your project needs. You can extract custom JSDoc tags for example, or implement support for a new Web Component library.

A plugin is a function that returns an object. There are several hooks you can opt in to:

- **analyzePhase**: Runs for each module, and gives access to the current Module's moduleDoc, and gives access to the AST nodes of your source code.
- **moduleLinkPhase**: Runs after a module is done analyzing, all information about your module should now be available. You can use this hook to stitch pieces of information together
- **packageLinkPhase**: Runs after all modules are done analyzing, and after post-processing. All information should now be available and linked together.

> **TIP:** When writing custom plugins, [ASTExplorer](https://astexplorer.net/#/gist/f99a9fba2c21e015d0a8590d291523e5/cce02565e487b584c943d317241991f19b105f94) is your friend 🙂

For a reference implementation of a plugin, you can take a look at the [Stencil plugin](/plugins/stencil.js), here's an example of a simpler plugin, that adds a custom JSDoc tag to a members doc:

Example source code:
```js

export class MyElement extends HTMLElement {
  /**
   * @editvia textarea[rows=2]
   */ 
  message = ''
}
```

`custom-elements-manifest.config.mjs`:
```js
import ts from 'typescript';

export default {
  plugins: [
    function myPlugin() {
      return {
        // Runs for each module
        analyzePhase({node, moduleDoc}){
          // You can use this phase to access a module's AST nodes and mutate the custom-elements-manifest
          switch (node.kind) {
            case ts.SyntaxKind.ClassDeclaration:
              const className = node.name.getText();

              node.members?.forEach(member => {
                const memberName = member.name.getText();

                member.jsDoc?.forEach(jsDoc => {
                  jsDoc.tags?.forEach(tag => {
                    if(tag.tagName.getText() === 'editvia') {
                      const description = tag.comment;

                      const classDeclaration = moduleDoc.declarations.find(declaration => declaration.name === className);
                      const messageField = classDeclaration.members.find(member => member.name === memberName);
                      
                      messageField.editvia = description
                    }
                  });
                });
              });
          }
        },
        // Runs for each module, after analyzing, all information about your module should now be available
        moduleLinkPhase({node, moduleDoc}){},
        // Runs after modules have been parsed and after post-processing
        packageLinkPhase(customElementsManifest){},
      }
    }
  ]  
}
```

You can also use plugins to output custom documentation:

```js
import path from 'path';
import fs from 'fs';

function generateReadme() {
  const components = ['my-component-a', 'my-component-b'];

  return {
    packageLinkPhase(cem) {
      cem.modules.forEach(mod => {
        mod.declarations.forEach(declaration => {
          if(components.includes(declaration.tagName)) {
            fs.writeFileSync(
              `${path.dirname(mod.path)}/README.md`, 
              renderClassdocAsMarkdown(declaration)
            );
          }
        });
      });
    }
  }
}
```

## How it works

`@custom-elements-manifest/analyzer` will scan the source files in your project, and run them through the TypeScript compiler to gather information about your package. Construction of the `custom-elements.json` happens in several phases:

### Analyze phase

During the analyze phase, `@custom-elements-manifest/analyzer` goes through the AST of every module in your package, and gathers as much information about them as possible, like for example a class and all its members, events, attributes, etc. During this phase it also gathers a modules imports, imports are not specified in `custom-elements.json`, but are required for the second phase, and then deleted once processed.

### Module link phase (per module)

During the module Link phase you can link information together about a current module. For example, if a module contains a class declaration, and a `customElements.define` call, you can already link the components `tagName` to the classDoc. You'll also have access to a modules imports during this phase.

### Package link phase (per package)

During the package link phase, we'll have all the information we need about a package and its custom elements, and we can start joining them together. Examples of this are:

- Finding a CustomElement's tagname by finding its `customElements.define()` call, if present
- Applying inheritance to classes (adding inherited members/attributes/events etc)
