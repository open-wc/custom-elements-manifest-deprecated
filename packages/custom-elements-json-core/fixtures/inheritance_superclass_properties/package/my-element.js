import { SuperClass } from './SuperClass.js';

class MyElement extends SuperClass {
  foo = 'foo';
}

customElements.define('my-element', MyElement);