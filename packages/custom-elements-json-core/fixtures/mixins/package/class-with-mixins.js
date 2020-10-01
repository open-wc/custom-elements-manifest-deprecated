import { MixinA } from 'foo';
import { MixinB } from './my-module.js';

const LocalMixin = superclass => class LocalMixin extends superclass {}

// should have two mixins, and HTMLElement as superclass
export class Foo extends MixinA(MixinB(LocalMixin(HTMLElement))) {}

// should have no mixins, and HTMLElement as superclass
export class Bar extends HTMLElement {}