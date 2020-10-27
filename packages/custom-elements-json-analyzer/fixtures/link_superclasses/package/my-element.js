import { LitElement } from 'lit-element';
import LocalImportedSuperclass from './my-module.js';

class MyElement extends HTMLElement {}

class LocalSuperclass extends HTMLElement {}

export class ExtendsLocal extends LocalSuperclass {}
export class ExtendsBaremodule extends LitElement {}
export class ExtendsLocalImported extends LocalImportedSuperclass {}

customElements.define('my-element', MyElement);