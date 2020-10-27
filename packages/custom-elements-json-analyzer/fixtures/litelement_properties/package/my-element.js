import { LitElement, property } from 'lit-element';

class MyElement extends LitElement {
  static properties = {
    prop1: { type: String }, // has default "'foo'"
    prop2: { type: Boolean },
    attr: { type: String, attribute: 'my-attr' }, // attr output as 'my-attr'
    noAttr: { type: String, attribute: false }, // no attr output
  }

  constructor() {
    super();
    this.prop1 = 'foo';
  }
}

customElements.define('my-element', MyElement);