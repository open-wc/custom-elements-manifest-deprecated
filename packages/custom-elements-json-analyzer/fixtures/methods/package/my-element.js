import { LitElement } from 'lit-element';

class MyElement extends LitElement {
  regular(){}
  #private(){} // should be private
  static staticMethod(){}

  public tsPublic(){}
  private tsPrivate(){}
  protected tsProtected(){}
  public static tsPublicStatic(){}

  /** @public */
  jsDocPublic(){}
  /** @private */
  jsDocPrivate(){}
  /** @protected */
  jsDocProtected(){}

  // should not appear in customElementsJson
  connectedCallback(){}
  disconnectedCallback(){}
  attributeChangedCallback(){}
  adoptedCallback(){}
  requestUpdate(){}
  performUpdate(){}
  shouldUpdate(){}
  update(){}
  updated(){}
  render(){}
  firstUpdated(){}
  updateComplete(){}
}

customElements.define('my-element', MyElement);