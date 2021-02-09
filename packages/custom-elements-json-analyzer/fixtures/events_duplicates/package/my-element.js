class MyElement extends HTMLElement {
  foo() {
    this.dispatchEvent(new Event('my-event'));
  }
  bar() {
    this.dispatchEvent(new Event('my-event'));
  }
}

customElements.define('my-element', MyElement);