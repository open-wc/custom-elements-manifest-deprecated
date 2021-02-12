import { LitElement } from 'lit-element';

export class MyElement extends LitElement {
  static get properties() {
    return {
      ...super.properties,
      foo: { type: Object },
    }
  }
}