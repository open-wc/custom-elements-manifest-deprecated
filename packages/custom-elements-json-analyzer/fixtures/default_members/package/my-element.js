class MyElement extends HTMLElement {
  shadow = this.attachShadow({mode: 'open'});
  functionCall = foo();
}

customElements.define('my-element', MyElement);