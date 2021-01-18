class MyElement extends HTMLElement {
  static observedAttributes = ['baz'];
}

customElements.define('my-element', MyElement);