import { NestedA, NestedB } from 'foo';

/**
 * @mixin {NestedA}
 * @mixin {NestedB}
 */
export const NestedMixins = superclass => class NestedMixins extends NestedA(NestedB(superclass)) {}

/**
 * @mixin {NestedA}
 */
const foo = true;