# TODO

## General

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
  mutated(mutationRecords: (MutationRecord & { target: HTMLElement })[]): void;
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

## Events

## Attributes

## Properties

## inheritance

## JSDoc
