# TODO

## General

- Workerize. We can do the TS ast stuff (getting a class and its information) in workers, and await until all workers are done. When all workers are done, we need to link a bunch of stuff together (find superclasses etc)
- Readme. Take table from rune playground as example

## LitElement

- ignore `static properties` and `static get properties`
- get properties/attrs from static get properties

## Polymer 3?

- `static properties` is a little bit different I think, I think it only adds a default value

## Methods

- Collect methods for a class

## declarations

- only add declarations if they're exported. Exported also means customElements.define()

## Exports

- Gather all exports for a module. You need it to find all relevant declarations. Note that customElements.define() counts as export.
  - I _think_ the check to find **relevant** declarations has to happen after the module analyze phase. Then delete whatever declaration is not in the exports

```js
function foo() {
  return true;
}
class MyEl extends HTMLElement {}
customElements.define('my-el', MyEl);
```

☝️ `MyEl` is present in declarations[] but `foo` is not

## TypeReference[]

- Get all fields/members of a class, add shallow type reference if possible
- After, loop/visit through currentModule, gather all imports, gather all interfaces/types and their package or local module
  - loop through all collected member, and try to match them to an import or local type (note: can only have a package OR module)

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
