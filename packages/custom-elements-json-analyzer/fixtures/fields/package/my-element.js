class MyElement extends HTMLElement {
  prop1;
  prop2 = 'bar';
  prop3 = 1;
  prop4 = [];
  prop5 = {};
  #prop6 = 'bar';

  /** @public */
  prop7;

  /** @private */
  prop8;

  /** @protected */
  prop9;

  public prop10;
  private prop11;
  protected prop12;

  static prop13;
}

customElements.define('my-element', MyElement);