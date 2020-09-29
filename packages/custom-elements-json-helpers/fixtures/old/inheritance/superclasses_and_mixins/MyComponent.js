import { LitElement } from './LitElement.js';

export const LocalizeMixin = klass => class LocalizeMixin extends klass {}
export const TabindexMixin = klass => class TabindexMixin extends klass {}

export class MyComponent extends TabindexMixin(LocalizeMixin(LitElement)) {

}

customElements.define('my-component', LitElement);