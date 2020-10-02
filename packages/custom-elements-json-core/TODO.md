I made a mistake regarding mixins. Mixin is actually a type of `ClassLike, FunctionLike` with a `kind: 'mixin'`.
You _can_ detect mixins:
Can make a `isMixin` function that checks the following cases:

```js
const MyMixin = klass => class MyMixin extends klass {};

const MyMixin = klass => {
  return class MyMixin extends klass {};
};

function MyMixin(klass) {
  return class MyMixin extends klass {};
}
```

If its a mixin, you also need to run `handleClass` on it somehow. Figure out how. Maybe it has to happen in the `visit` function:

```js
  function visitNode(node: ts.Node) {
    switch (node.kind) {
```

before the switch/case, and then if it is a mixin, call `handleClass` on the ast node?

If this works, a mixin can have a `mixins: Mixin[]` property, and the nested mixins usecase should work

- [x] Gather imports
- [ ] Gather types
- [x] Mixins
  - [x] Get mixins from handleClass
  - [x] Mixins for functions that are JSDoc tagged to have mixins
  - [x] Link a Mixin to its package or modules. A mixin can either be imported, or it can be a declaration if its locally defined, so loop through imports and declarations and match it
- [x] Superclass - find if its locally declared or imported and add reference to it (similar to mixin implementation)
- [ ] Inheritance
  - [ ] implement in helpers
  - [ ] add inherited properties/attrs/events to a class
- [x] LitElement support
- [ ] Implement Types for everything that can have a type
  - [ ] Loop through everything that can have a type and resolve it
- [x] Class methods
