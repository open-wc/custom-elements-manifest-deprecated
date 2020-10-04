import { MyMixin } from './MyMixin.js';

class MyElement extends MyMixin(HTMLElement) {
  static get observedAttributes() {
    return [...super.observedAttributes, 'disabled'];
  }
}

customElements.define('my-element', MyElement);