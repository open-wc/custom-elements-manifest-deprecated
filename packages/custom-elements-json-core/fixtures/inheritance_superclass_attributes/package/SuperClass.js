export class SuperClass extends HTMLElement {
  static get observedAttributes() {
    return ['vertical'];
  }
}