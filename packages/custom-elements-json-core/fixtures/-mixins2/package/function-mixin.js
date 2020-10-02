import { NestedA, NestedB } from 'foo';

/**
 * @mixin {NestedA}
 * @mixin {NestedB}
 */
export function NestedMixins(superclass) {
  return superclass => class NestedMixins extends NestedA(NestedB(superclass)) {}
}

/**
 * @mixin {NestedA}
 */
const foo = true;