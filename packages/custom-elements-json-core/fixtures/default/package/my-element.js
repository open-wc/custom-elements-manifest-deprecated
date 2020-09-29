class MyElement extends HTMLElement {
  foo = 'bar';
}

customElements.define('my-element', MyElement);