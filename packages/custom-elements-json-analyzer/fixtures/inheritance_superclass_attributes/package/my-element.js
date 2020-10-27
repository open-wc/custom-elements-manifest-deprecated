import { SuperClass } from './SuperClass.js';

class MyElement extends SuperClass {
  static get observedAttributes() {
    return [...super.observedAttributes, 'disabled'];
  }
}

customElements.define('my-element', MyElement);