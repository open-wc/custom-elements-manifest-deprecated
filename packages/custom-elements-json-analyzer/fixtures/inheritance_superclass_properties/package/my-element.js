import { SuperClass } from './SuperClass.js';

class MyElement extends SuperClass {
  foo = 'foo';
  overRideableMethod(){}
}

customElements.define('my-element', MyElement);