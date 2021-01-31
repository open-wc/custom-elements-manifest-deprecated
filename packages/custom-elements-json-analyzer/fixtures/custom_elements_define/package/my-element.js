import {MyFoo} from './foo.js';
import {MyBar} from 'foo';

class MyElement extends HTMLElement {
  foo = 'bar';
}

customElements.define('my-foo', MyFoo);
customElements.define('my-bar', MyBar);
customElements.define('my-element', MyElement);