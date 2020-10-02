import { LitElement, property } from 'lit-element';

class MyElement extends LitElement {
  // also attr
  @property({})
  decoratedProperty = [];

  // attr output with name 'my-attr'
  @property({attribute: 'my-attr'})
  decoratedPropertyAlsoAttr = [];

  // no attr output
  @property({attribute: false})
  decoratedPropertyNoAttr = [];

}

customElements.define('my-element', MyElement);