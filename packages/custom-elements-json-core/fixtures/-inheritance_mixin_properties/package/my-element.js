import { MyMixin } from './MyMixin.js';

class MyElement extends MyMixin(HTMLElement) {
  foo = 'foo';
}

customElements.define('my-element', MyElement);