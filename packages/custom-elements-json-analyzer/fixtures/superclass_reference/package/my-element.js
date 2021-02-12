import { LitElement } from 'lit-element';
import { LocalElement } from './local.js';

class CurrentElement extends HTMLElement {}

// superclass reference empty
export class Empty extends HTMLElement {}
// superclass is in current module
export class Current extends CurrentElement {}
// superclass reference is package
export class Package extends LitElement {}
// superclass reference is local module
export class LocalModule extends LocalElement {}
