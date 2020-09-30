# TODO

## General

- Workerize. We can do the TS ast stuff (getting a class and its information) in workers, and await until all workers are done. When all workers are done, we need to link a bunch of stuff together (find superclasses etc)
- Readme. Take table from rune playground as example

## LitElement

- ignore `static properties` and `static get properties`
- get properties/attrs from static get properties

## Polymer 3?

- `static properties` is a little bit different I think, I think it only adds a default value

## Classes

### Mixins

- get mixins for a class, e.g.: class Foo extends MyMixin(Bar) {}
- how to detect exported mixins? e.g.: export const MyMixin = klass => class MyMixin extends klass {}
  - do I even need to? if its referenced as mixin in the classdoc and has a declaration to the mixin
- what about nested mixins?

### Methods

- Collect methods for a class

## Exports

## Imports

- During analyze phase collect imports, store in `new Map()` (the names of an import are unique, so you can easily get it from the map)
- After analyze phase, you can use this to link types, but also `References`
- Maybe also during this phase collect any types you can find?

fixture:

```js
import defaultExport from 'foo';
import * as name from './my-module.js';
import { export1, export2 } from 'foo';
import { export1 as alias1 } from 'foo';
import { export1, export2 as alias2 } from 'foo';
import defaultExport, { export1 } from 'foo';
import defaultExport, * as name from 'foo';
```

```typescript
export interface Import {
  name: string;
  kind: "default" | "named" | "aggregate",
  importPath: string;
  isBaremoduleSpecifier: boolean
}

const imports = new Map()<string, Import>;
const obj = {
  "name": "defaultExport",
  "kind": "default|named|aggregate",
  "importPath": "foo",
  "isBareModuleSpecifier": true,
}
imports.set('defaultExport', obj);
```

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

## Attributes

## Properties

- for fields/getters/setters: dont try to infer types from JS. Only add types if specifically added with jsdoc or ts
- Related attrs, with jsdoc (see playground)

## inheritance

- Add inherited properties/events/attrs/methods to a class with "inheritedFrom" prop
  - happens after analyze phase
  - should be easy to implement with the logic for getInheritanceTree

## Lite

- Create a 'lite' parser that exclusively checks jsdocs

```js
/**
 * @export
 *
 */
export function foo() {}

/**
 * @export
 * @tagName my-element
 * @superclass LitElement - // this could be taken from imports
 * @attr
 * @prop {boolean} disabled - disables the component
 * @fires {Event} disabled-changed - fired when the component is disabled
 */
class MyElement extends LitElement {
  static properties = {
    disabled: { type: Boolean, reflect: true },
  };
  fire() {
    this.dispatchEvent(new Event('disabled-changed'));
  }
}
customElements.define('my-element', MyElement);
```
