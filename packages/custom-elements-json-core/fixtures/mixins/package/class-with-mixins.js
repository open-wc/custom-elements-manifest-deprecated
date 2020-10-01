import { MixinA } from 'foo';
import { MixinB } from './my-module.js';

// should have two mixins, and HTMLElement as superclass
export class Foo extends MixinA(MixinB(HTMLElement)) {}

// should have no mixins, and HTMLElement as superclass
export class Bar extends HTMLElement {}