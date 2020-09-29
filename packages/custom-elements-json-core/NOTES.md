# TODO

## General
- Workerize. We can do the TS ast stuff (getting a class and its information) in workers, and await until all workers are done. When all workers are done, we need to link a bunch of stuff together (find superclasses etc)
- Readme. Take table from rune playground as example

## declarations
- only add declarations if they're exported. Exported also means customElements.define()

## Events
- types for events?

## Attributes

## Properties
- for fields/getters/setters: dont try to infer types from JS. Only add types if specifically added with jsdoc or ts
- Related attrs, with jsdoc (see playground)
