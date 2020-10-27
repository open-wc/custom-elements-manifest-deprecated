/**
 * @attr {boolean} disabled - disables the element
 * @attribute {string} foo - description for foo
 */
class MyElement extends HTMLElement {
  static observedAttributes = ['baz', 'bar'];

  static get observedAttributes() {
    return ['foo', 'bar'];
  }
}

customElements.define('my-element', MyElement);