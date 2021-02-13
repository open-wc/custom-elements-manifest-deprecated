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

| Command/option   | Type       | Description             |
| ---------------- | ---------- | ----------------------- |
| analyze          |            | Analyze your components |
| --glob           | string[]   | Globs to analyze        |
| --exclude        | string[]   | Globs to exclude        |

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

`@custom-elements-manifest/analyzer` currently supports:

- Vanilla web components
- LitElement

Support for other web component libraries may be added in the future. Feel free to create an issue, or a pull request.

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
 */
class MyElement extends HTMLElement {}
```

## How it works

`@custom-elements-manifest/analyzer` will scan the source files in your project, and run them through the TypeScript compiler to gather information about your package. Construction of the `custom-elements.json` happens in two phases:

### Analyze phase

During the analyze phase, `@custom-elements-manifest/analyzer` goes through the AST of every module in your package, and gathers as much information about them as possible, like for example a class and all its members, events, attributes, etc. During this phase it also gathers a modules imports, imports are not specified in `custom-elements.json`, but are required for the second phase, and then deleted once processed.

### Link phase

During the link phase, we'll have all the information we need about a package and its custom elements, and we can start joining them together. Examples of this are:

- Finding a CustomElement's tagname by finding its `customElements.define()` call, if present
- Applying inheritance to classes (adding inherited members/attributes/events etc)
