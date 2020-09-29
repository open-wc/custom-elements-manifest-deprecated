# @custom-elements-json/helpers

> ⚠️ Very experimental and very unfinished

Custom-elements.json is a file format that describes custom elements. This format will allow tooling and IDEs to give rich information about the custom elements in a given project. It is, however, very experimental and things are subject to change. Follow the discussion [here](https://github.com/webcomponents/custom-elements-json).

This library aims to ship some helpers to ease working with the custom-elements.json format.

## Usage

```js
// Node
import { CustomElementsJson } from '@custom-elements-json/helpers';

const foo = JSON.parse(fs.readFileSync('./custom-elements.json', 'utf-8'))
const customElementsJson = new CustomElementsJson(json);

// Browser
import { CustomElementsJson } from 'https://unpkg.com/@custom-elements-json/helpers/dist/esm/index.js';

const json = await (await fetch('./custom-elements.json')).json();
const customElementsJson = new CustomElementsJson(json);
```

### Methods

<hr>

#### `getByTagName`

Returns all information for element `<my-element>`.
```js
customElementsJson.getByTagName('my-element');
```

<details>

<summary><code>custom-elements.json</code></summary>

```json
{
  "version": "experimental",
  "modules": [
    {
      "path": "./src/MyMixinB.js",
      "exports": [
        {
          "kind": "variable",
          "name": "MyMixinB",
          "type": "(klass: any) => typeof MyMixinB"
        }
      ]
    },
    {
      "path": "./src/MySuperClass.js",
      "exports": [
        {
          "kind": "class",
          "superclass": {
            "name": "HTMLElement"
          },
          "name": "MySuperClass",
          "mixins": [
            {
              "name": "MyMixinB",
              "module": "./src/MyMixinB.js"
            }
          ],
          "members": [
            {
              "kind": "field",
              "name": "text",
              "type": "string",
              "default": "\"b\""
            }
          ]
        }
      ]
    },
    {
      "path": "./src/AnotherSuperClass.js",
      "exports": [
        {
          "kind": "class",
          "superclass": {
            "name": "MySuperClass",
            "module": "./src/MySuperClass.js"
          },
          "name": "AnotherSuperClass",
          "members": [
            {
              "kind": "field",
              "name": "label",
              "type": "string",
              "default": "\"d\""
            },
            {
              "kind": "field",
              "name": "text",
              "type": "string",
              "default": "\"b\"",
              "inheritedFrom": {
                "name": "MySuperClass",
                "module": "./src/MySuperClass.js"
              }
            }
          ]
        }
      ]
    },
    {
      "path": "./src/my-element.js",
      "exports": [
        {
          "kind": "definition",
          "name": "my-element",
          "declaration": {
            "name": "MyElement",
            "module": "./src/my-element.js"
          }
        },
        {
          "kind": "class",
          "superclass": {
            "name": "HTMLElement"
          },
          "name": "MyElement",
          "members": [
            {
              "kind": "field",
              "name": "foo",
              "type": "string",
              "default": "\"bar\""
            }
          ],
          "tagName": "my-element"
        }
      ]
    },
    {
      "path": "./src/another-component.js",
      "exports": [
        {
          "kind": "definition",
          "name": "another-component",
          "declaration": {
            "name": "AnotherComponent",
            "module": "./src/another-component.js"
          }
        },
        {
          "kind": "class",
          "superclass": {
            "name": "AnotherSuperClass",
            "module": "./src/AnotherSuperClass.js"
          },
          "name": "AnotherComponent",
          "members": [
            {
              "kind": "field",
              "name": "baz",
              "type": "string",
              "default": "\"bar\""
            },
            {
              "kind": "field",
              "name": "label",
              "type": "string",
              "default": "\"d\"",
              "inheritedFrom": {
                "name": "AnotherSuperClass",
                "module": "./src/AnotherSuperClass.js"
              }
            },
            {
              "kind": "field",
              "name": "text",
              "type": "string",
              "default": "\"b\"",
              "inheritedFrom": {
                "name": "MySuperClass",
                "module": "./src/MySuperClass.js"
              }
            }
          ],
          "tagName": "another-component"
        }
      ]
    }
  ]
}
```

</details>

<details>
<summary>Result</summary>

```js
{
  kind: 'class',
  superclass: { name: 'HTMLElement' },
  name: 'MyElement',
  members: [ { kind: 'field', name: 'foo', type: 'string', default: '"bar"' } ],
  tagName: 'my-element'
}
```

</details>

<hr>

#### `getByClassName`

Returns all information for class `MyElement`.
```js
customElementsJson.getByClassName('MyElement');
```

<details>

<summary><code>custom-elements.json</code></summary>

```json
{
  "version": "experimental",
  "modules": [
    {
      "path": "./src/MyMixinB.js",
      "exports": [
        {
          "kind": "variable",
          "name": "MyMixinB",
          "type": "(klass: any) => typeof MyMixinB"
        }
      ]
    },
    {
      "path": "./src/MySuperClass.js",
      "exports": [
        {
          "kind": "class",
          "superclass": {
            "name": "HTMLElement"
          },
          "name": "MySuperClass",
          "mixins": [
            {
              "name": "MyMixinB",
              "module": "./src/MyMixinB.js"
            }
          ],
          "members": [
            {
              "kind": "field",
              "name": "text",
              "type": "string",
              "default": "\"b\""
            }
          ]
        }
      ]
    },
    {
      "path": "./src/AnotherSuperClass.js",
      "exports": [
        {
          "kind": "class",
          "superclass": {
            "name": "MySuperClass",
            "module": "./src/MySuperClass.js"
          },
          "name": "AnotherSuperClass",
          "members": [
            {
              "kind": "field",
              "name": "label",
              "type": "string",
              "default": "\"d\""
            },
            {
              "kind": "field",
              "name": "text",
              "type": "string",
              "default": "\"b\"",
              "inheritedFrom": {
                "name": "MySuperClass",
                "module": "./src/MySuperClass.js"
              }
            }
          ]
        }
      ]
    },
    {
      "path": "./src/my-element.js",
      "exports": [
        {
          "kind": "definition",
          "name": "my-element",
          "declaration": {
            "name": "MyElement",
            "module": "./src/my-element.js"
          }
        },
        {
          "kind": "class",
          "superclass": {
            "name": "HTMLElement"
          },
          "name": "MyElement",
          "members": [
            {
              "kind": "field",
              "name": "foo",
              "type": "string",
              "default": "\"bar\""
            }
          ],
          "tagName": "my-element"
        }
      ]
    },
    {
      "path": "./src/another-component.js",
      "exports": [
        {
          "kind": "definition",
          "name": "another-component",
          "declaration": {
            "name": "AnotherComponent",
            "module": "./src/another-component.js"
          }
        },
        {
          "kind": "class",
          "superclass": {
            "name": "AnotherSuperClass",
            "module": "./src/AnotherSuperClass.js"
          },
          "name": "AnotherComponent",
          "members": [
            {
              "kind": "field",
              "name": "baz",
              "type": "string",
              "default": "\"bar\""
            },
            {
              "kind": "field",
              "name": "label",
              "type": "string",
              "default": "\"d\"",
              "inheritedFrom": {
                "name": "AnotherSuperClass",
                "module": "./src/AnotherSuperClass.js"
              }
            },
            {
              "kind": "field",
              "name": "text",
              "type": "string",
              "default": "\"b\"",
              "inheritedFrom": {
                "name": "MySuperClass",
                "module": "./src/MySuperClass.js"
              }
            }
          ],
          "tagName": "another-component"
        }
      ]
    }
  ]
}
```

</details>

<details>
<summary>Result</summary>

```js
{
  kind: 'class',
  superclass: { name: 'HTMLElement' },
  name: 'MyElement',
  members: [ { kind: 'field', name: 'foo', type: 'string', default: '"bar"' } ],
  tagName: 'my-element'
}
```

</details>

<hr>

#### `getClasses`

Returns all classes in a `custom-elements.json`
```js
customElementsJson.getClasses();
```

<details>

<summary><code>custom-elements.json</code></summary>

```json
{
  "version": "experimental",
  "modules": [
    {
      "path": "./src/MyMixinB.js",
      "exports": [
        {
          "kind": "variable",
          "name": "MyMixinB",
          "type": "(klass: any) => typeof MyMixinB"
        }
      ]
    },
    {
      "path": "./src/MySuperClass.js",
      "exports": [
        {
          "kind": "class",
          "superclass": {
            "name": "HTMLElement"
          },
          "name": "MySuperClass",
          "mixins": [
            {
              "name": "MyMixinB",
              "module": "./src/MyMixinB.js"
            }
          ],
          "members": [
            {
              "kind": "field",
              "name": "text",
              "type": "string",
              "default": "\"b\""
            }
          ]
        }
      ]
    },
    {
      "path": "./src/AnotherSuperClass.js",
      "exports": [
        {
          "kind": "class",
          "superclass": {
            "name": "MySuperClass",
            "module": "./src/MySuperClass.js"
          },
          "name": "AnotherSuperClass",
          "members": [
            {
              "kind": "field",
              "name": "label",
              "type": "string",
              "default": "\"d\""
            },
            {
              "kind": "field",
              "name": "text",
              "type": "string",
              "default": "\"b\"",
              "inheritedFrom": {
                "name": "MySuperClass",
                "module": "./src/MySuperClass.js"
              }
            }
          ]
        }
      ]
    },
    {
      "path": "./src/my-element.js",
      "exports": [
        {
          "kind": "definition",
          "name": "my-element",
          "declaration": {
            "name": "MyElement",
            "module": "./src/my-element.js"
          }
        },
        {
          "kind": "class",
          "superclass": {
            "name": "HTMLElement"
          },
          "name": "MyElement",
          "members": [
            {
              "kind": "field",
              "name": "foo",
              "type": "string",
              "default": "\"bar\""
            }
          ],
          "tagName": "my-element"
        }
      ]
    },
    {
      "path": "./src/another-component.js",
      "exports": [
        {
          "kind": "definition",
          "name": "another-component",
          "declaration": {
            "name": "AnotherComponent",
            "module": "./src/another-component.js"
          }
        },
        {
          "kind": "class",
          "superclass": {
            "name": "AnotherSuperClass",
            "module": "./src/AnotherSuperClass.js"
          },
          "name": "AnotherComponent",
          "members": [
            {
              "kind": "field",
              "name": "baz",
              "type": "string",
              "default": "\"bar\""
            },
            {
              "kind": "field",
              "name": "label",
              "type": "string",
              "default": "\"d\"",
              "inheritedFrom": {
                "name": "AnotherSuperClass",
                "module": "./src/AnotherSuperClass.js"
              }
            },
            {
              "kind": "field",
              "name": "text",
              "type": "string",
              "default": "\"b\"",
              "inheritedFrom": {
                "name": "MySuperClass",
                "module": "./src/MySuperClass.js"
              }
            }
          ],
          "tagName": "another-component"
        }
      ]
    }
  ]
}
```

</details>

<details>
<summary>Result</summary>

```js
[
  {
    kind: 'class',
    superclass: { name: 'HTMLElement' },
    name: 'MySuperClass',
    mixins: [ [Object] ],
    members: [ [Object] ]
  },
  {
    kind: 'class',
    superclass: { name: 'MySuperClass', module: './src/MySuperClass.js' },
    name: 'AnotherSuperClass',
    members: [ [Object], [Object] ]
  },
  {
    kind: 'class',
    superclass: { name: 'HTMLElement' },
    name: 'MyElement',
    members: [ [Object] ],
    tagName: 'my-element'
  },
  {
    kind: 'class',
    superclass: { name: 'AnotherSuperClass', module: './src/AnotherSuperClass.js' },
    name: 'AnotherComponent',
    members: [ [Object], [Object], [Object] ],
    tagName: 'another-component'
  }
]
```

</details>

<hr>

#### `getMixins`

Returns all mixins in a `custom-elements.json`
```js
customElementsJson.getMixins();
```

<details>

<summary><code>custom-elements.json</code></summary>

```json
{
  "version": "experimental",
  "modules": [
    {
      "path": "./src/MyMixinB.js",
      "exports": [
        {
          "kind": "variable",
          "name": "MyMixinB",
          "type": "(klass: any) => typeof MyMixinB"
        }
      ]
    },
    {
      "path": "./src/MySuperClass.js",
      "exports": [
        {
          "kind": "class",
          "superclass": {
            "name": "HTMLElement"
          },
          "name": "MySuperClass",
          "mixins": [
            {
              "name": "MyMixinB",
              "module": "./src/MyMixinB.js"
            }
          ],
          "members": [
            {
              "kind": "field",
              "name": "text",
              "type": "string",
              "default": "\"b\""
            }
          ]
        }
      ]
    },
    {
      "path": "./src/AnotherSuperClass.js",
      "exports": [
        {
          "kind": "class",
          "superclass": {
            "name": "MySuperClass",
            "module": "./src/MySuperClass.js"
          },
          "name": "AnotherSuperClass",
          "members": [
            {
              "kind": "field",
              "name": "label",
              "type": "string",
              "default": "\"d\""
            },
            {
              "kind": "field",
              "name": "text",
              "type": "string",
              "default": "\"b\"",
              "inheritedFrom": {
                "name": "MySuperClass",
                "module": "./src/MySuperClass.js"
              }
            }
          ]
        }
      ]
    },
    {
      "path": "./src/my-element.js",
      "exports": [
        {
          "kind": "definition",
          "name": "my-element",
          "declaration": {
            "name": "MyElement",
            "module": "./src/my-element.js"
          }
        },
        {
          "kind": "class",
          "superclass": {
            "name": "HTMLElement"
          },
          "name": "MyElement",
          "members": [
            {
              "kind": "field",
              "name": "foo",
              "type": "string",
              "default": "\"bar\""
            }
          ],
          "tagName": "my-element"
        }
      ]
    },
    {
      "path": "./src/another-component.js",
      "exports": [
        {
          "kind": "definition",
          "name": "another-component",
          "declaration": {
            "name": "AnotherComponent",
            "module": "./src/another-component.js"
          }
        },
        {
          "kind": "class",
          "superclass": {
            "name": "AnotherSuperClass",
            "module": "./src/AnotherSuperClass.js"
          },
          "name": "AnotherComponent",
          "members": [
            {
              "kind": "field",
              "name": "baz",
              "type": "string",
              "default": "\"bar\""
            },
            {
              "kind": "field",
              "name": "label",
              "type": "string",
              "default": "\"d\"",
              "inheritedFrom": {
                "name": "AnotherSuperClass",
                "module": "./src/AnotherSuperClass.js"
              }
            },
            {
              "kind": "field",
              "name": "text",
              "type": "string",
              "default": "\"b\"",
              "inheritedFrom": {
                "name": "MySuperClass",
                "module": "./src/MySuperClass.js"
              }
            }
          ],
          "tagName": "another-component"
        }
      ]
    }
  ]
}
```

</details>

<details>
<summary>Result</summary>

```js
[
  {
    name: 'MyMixinB',
    module: './src/MyMixinB.js',
    kind: 'variable',
    type: '(klass: any) => typeof MyMixinB'
  }
]
```

</details>

<hr>

#### `getDefinitions`

Returns all custom element definitions in a `custom-elements.json`
```js
customElementsJson.getDefinitions();
```

<details>

<summary><code>custom-elements.json</code></summary>

```json
{
  "version": "experimental",
  "modules": [
    {
      "path": "./src/MyMixinB.js",
      "exports": [
        {
          "kind": "variable",
          "name": "MyMixinB",
          "type": "(klass: any) => typeof MyMixinB"
        }
      ]
    },
    {
      "path": "./src/MySuperClass.js",
      "exports": [
        {
          "kind": "class",
          "superclass": {
            "name": "HTMLElement"
          },
          "name": "MySuperClass",
          "mixins": [
            {
              "name": "MyMixinB",
              "module": "./src/MyMixinB.js"
            }
          ],
          "members": [
            {
              "kind": "field",
              "name": "text",
              "type": "string",
              "default": "\"b\""
            }
          ]
        }
      ]
    },
    {
      "path": "./src/AnotherSuperClass.js",
      "exports": [
        {
          "kind": "class",
          "superclass": {
            "name": "MySuperClass",
            "module": "./src/MySuperClass.js"
          },
          "name": "AnotherSuperClass",
          "members": [
            {
              "kind": "field",
              "name": "label",
              "type": "string",
              "default": "\"d\""
            },
            {
              "kind": "field",
              "name": "text",
              "type": "string",
              "default": "\"b\"",
              "inheritedFrom": {
                "name": "MySuperClass",
                "module": "./src/MySuperClass.js"
              }
            }
          ]
        }
      ]
    },
    {
      "path": "./src/my-element.js",
      "exports": [
        {
          "kind": "definition",
          "name": "my-element",
          "declaration": {
            "name": "MyElement",
            "module": "./src/my-element.js"
          }
        },
        {
          "kind": "class",
          "superclass": {
            "name": "HTMLElement"
          },
          "name": "MyElement",
          "members": [
            {
              "kind": "field",
              "name": "foo",
              "type": "string",
              "default": "\"bar\""
            }
          ],
          "tagName": "my-element"
        }
      ]
    },
    {
      "path": "./src/another-component.js",
      "exports": [
        {
          "kind": "definition",
          "name": "another-component",
          "declaration": {
            "name": "AnotherComponent",
            "module": "./src/another-component.js"
          }
        },
        {
          "kind": "class",
          "superclass": {
            "name": "AnotherSuperClass",
            "module": "./src/AnotherSuperClass.js"
          },
          "name": "AnotherComponent",
          "members": [
            {
              "kind": "field",
              "name": "baz",
              "type": "string",
              "default": "\"bar\""
            },
            {
              "kind": "field",
              "name": "label",
              "type": "string",
              "default": "\"d\"",
              "inheritedFrom": {
                "name": "AnotherSuperClass",
                "module": "./src/AnotherSuperClass.js"
              }
            },
            {
              "kind": "field",
              "name": "text",
              "type": "string",
              "default": "\"b\"",
              "inheritedFrom": {
                "name": "MySuperClass",
                "module": "./src/MySuperClass.js"
              }
            }
          ],
          "tagName": "another-component"
        }
      ]
    }
  ]
}
```

</details>

<details>
<summary>Result</summary>

```js
[
  {
    kind: 'definition',
    name: 'my-element',
    declaration: { name: 'MyElement', module: './src/my-element.js' }
  },
  {
    kind: 'definition',
    name: 'another-component',
    declaration: { name: 'AnotherComponent', module: './src/another-component.js' }
  }
]
```

</details>

<hr>

#### `getInheritanceTree`

Returns inheritance for class `MyComponent`.
```js
customElementsJson.getInheritanceTree('MyComponent');
```

<details>

<summary><code>custom-elements.json</code></summary>

```json
{
  "version": "experimental",
  "modules": [
    {
      "path": "./dev/src/custom-element/LitElement.js",
      "exports": [
        {
          "kind": "class",
          "superclass": {
            "name": "UpdatingElement",
            "module": "./dev/src/custom-element/UpdatingElement.js"
          },
          "name": "LitElement"
        }
      ]
    },
    {
      "path": "./dev/src/custom-element/MyComponent.js",
      "exports": [
        {
          "kind": "definition",
          "name": "my-component",
          "declaration": {
            "name": "LitElement",
            "module": "./dev/src/custom-element/LitElement.js"
          }
        },
        {
          "kind": "class",
          "superclass": {
            "name": "LitElement",
            "module": "./dev/src/custom-element/LitElement.js"
          },
          "mixins": [
            {
              "name": "TabindexMixin",
              "module": "./dev/src/custom-element/MyComponent.js"
            },
            {
              "name": "LocalizeMixin",
              "module": "./dev/src/custom-element/MyComponent.js"
            }
          ],
          "name": "MyComponent"
        },
        {
          "kind": "class",
          "name": "TabindexMixin"
        },
        {
          "kind": "class",
          "name": "LocalizeMixin"
        },
        {
          "kind": "variable",
          "name": "LocalizeMixin",
          "type": "(klass: any) => typeof LocalizeMixin"
        },
        {
          "kind": "variable",
          "name": "TabindexMixin",
          "type": "(klass: any) => typeof TabindexMixin"
        }
      ]
    },
    {
      "path": "./dev/src/custom-element/UpdatingElement.js",
      "exports": [
        {
          "kind": "class",
          "superclass": {
            "name": "HTMLElement"
          },
          "name": "UpdatingElement"
        }
      ]
    }
  ]
}
```

</details>

<details>
<summary>Result</summary>

```js
[
  {
    kind: 'class',
    superclass: {
      name: 'LitElement',
      module: './dev/src/custom-element/LitElement.js'
    },
    mixins: [ [Object], [Object] ],
    name: 'MyComponent'
  },
  {
    name: 'TabindexMixin',
    module: './dev/src/custom-element/MyComponent.js',
    kind: 'variable',
    type: '(klass: any) => typeof TabindexMixin'
  },
  {
    name: 'LocalizeMixin',
    module: './dev/src/custom-element/MyComponent.js',
    kind: 'variable',
    type: '(klass: any) => typeof LocalizeMixin'
  },
  {
    kind: 'class',
    superclass: {
      name: 'UpdatingElement',
      module: './dev/src/custom-element/UpdatingElement.js'
    },
    name: 'LitElement'
  },
  {
    kind: 'class',
    superclass: { name: 'HTMLElement' },
    name: 'UpdatingElement'
  }
]
```

</details>

<hr>

## Helper functions

Additionally the following helper functions are available. These functions can help you when developing custom tooling for `custom-elements.json`, and make your code more declarative.

Demo:

```js
import * as h from '@custom-elements-json/helpers';

const json = require('./custom-elements.json');

if (h.hasModules(json)) {
  json.modules.forEach(_module => {
    if (h.hasExports(_module)) {
      _module.exports.forEach(_export => {
        if (h.isClass(_export) && h.hasAttributes(_export)) {
          const attrs = _export.attributes;
          // do something with attributes
        }
      });
    }
  });
});

```

### Package
- `hasModules(package: PackageDoc) => boolean`

### Module
- `hasExports(module: ModuleDoc) => boolean`

### Export
- `isClass(export: ExportDoc) => boolean`
- `isFunction(export: ExportDoc) => boolean`
- `isVariable(export: ExportDoc) => boolean`
- `isDefinition(export: ExportDoc) => boolean`

### CustomElement
- `hasAttributes(customElement: CustomElementDoc) => boolean`
- `hasEvents(customElement: CustomElementDoc) => boolean`
- `hasSlots(customElement: CustomElementDoc) => boolean`
- `hasMethods(customElement: CustomElementDoc) => boolean`
- `hasFields(customElement: CustomElementDoc) => boolean`
- `hasMixins(customElement: CustomElementDoc) => boolean`

### ClassMember
- `isField(member: ClassMember) => boolean`
- `isMethod(member: ClassMember) => boolean`

## Contributing

Developing:

```bash
npm run tsc:watch
# in a separate terminal
npm run start
```

Testing:

```bash
npm test
```

## Usecases

- [x] Get all information for a given class (this should include the information of any superclasses or mixins)
- [x] Get all information for a given tagName (this should include the information of any superclasses or mixins)
- [x] Get all mixins
- [x] Get all classes
- [x] Get all definitions
- [ ] Get attributes for a given class or tagName
- [ ] Get properties for a given class or tagName
- [ ] Get cssProperties for a given class or tagName
- [ ] Get cssParts for a given class or tagName
- [ ] Get events for a given class or tagName
- [ ] Get slots for a given class or tagName
- more? What sort of things would be helpful? Create an issue if you have any ideas

## Goals

- It'd be nice to have this library be fully isomorphic (runs in node and the browser)