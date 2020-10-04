import { MyMixin } from './MyMixin.js';

class MyElement extends MyMixin(HTMLElement) {
  foo = 'foo';
  overRideableMethod(){}
}

customElements.define('my-element', MyElement);