# TODO

## General

- Workerize. We can do the TS ast stuff (getting a class and its information) in workers, and await until all workers are done. When all workers are done, we need to link a bunch of stuff together (find superclasses etc)
- Readme/docs

## LitElement

## Polymer 3?

- `static properties` is a little bit different I think, but I think it only adds a default value

## Classes

### Mixins

### Methods

## Exports

## Imports

## TypeReference[]

- Get all fields/members of a class, add shallow type reference if possible
- After, loop/visit through currentModule, gather all imports, gather all interfaces/types and their package or local module
  - loop through all collected member, and try to match them to an import or local type (note: can only have a package OR module)
- should happen after analyze phase? Loop through all declarations (and exports?) and if something doesnt have a type, try to find it?

```js
const typeString = 'Array<Foo | Bar>';
const types = ['Array', 'Foo', 'Bar'];

types.forEach(type => {
  const start = typeString.search(type);
  const end = start + type.length;
});
```

```ts
import { Foo } from 'lit-element';
import { Bar } from './local-module';

class MyElement extends HTMLElement {
  prop1: Array<FooElement | BarElement> = [];
  prop2: Array<FooElement | BarElement>;
  prop3: string[];
  prop4: Foo | Bar;
  prop5: Map<string, PropertyKey>;
  prop6: Map<keyof T, unknown>;
  prop7: string;
}

customElements.define('my-element', MyElement);
```

```js
Array<Foo | Bar>
[
  {
    name: "Array";
    start?: 0;
    end?: 4;
  },
  {
    name: "Foo";
    start?: 6;
    end?: 8;
    package?: 'lit-element'; // its either imported from a npm package, or a local module
  },
  {
    name: "Bar";
    start?: 12;
    end?: 14;
    module?: './local-module';
  },
]
```

## Slots

- We can do a check for innerHTML and check the html tagged template literal with dom5 and see if slots(/slots with names) are present
  - probably only look in the current module
  - we can use the same approach for parts

## Events

- types for events?
- support the following (jsdoc)

```js
/**
 * Dispatched when the enter key is pressed
 */
this.dispatchEvent(new CustomEvent('enter'));
```

## Attributes

## Properties

- Related attrs, with jsdoc (see playground)

## inheritance

- Add inherited properties/events/attrs/methods to a class with "inheritedFrom" prop
  - happens after analyze phase
  - should be easy to implement with the logic for getInheritanceTree

## JSDoc

- [ ] Support jsdoc description/summary for everything
- [ ] Support jsdoc for class field, or default setting stuff in the constructor
- [ ] Deal with jsdoc type imports, e.g. `{import('foo').SomeType}`

```js
/**
 * Size of the text field
 * @attr
 * @type {"small"|"large"}
 */
size = "large";

constructor() {
  super();
  /**
   * Size of the text field
   * @attr
   * @type {"small"|"large"}
   */
  this.size = "large";
}
```

```js
  static get observedAttributes() {
    return [
    /** some jsdoc */
    "placeholder",
    /** more jsdoc */
    "disabled",
    ];
  }
```
