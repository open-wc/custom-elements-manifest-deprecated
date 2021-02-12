class MyElement extends HTMLElement {
  shadow = this.attachShadow({mode: 'open'});
  functionCall = foo();
  arrowFunction = day => day;

  constructor() {
    super();
    this.foo = day => day;
  }

  static get properties() {
    return {
      foo: { type: Object }
    }
  }
}

customElements.define('my-element', MyElement);