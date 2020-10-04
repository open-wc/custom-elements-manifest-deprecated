class MyElement extends HTMLElement {
  /** getter & setter */
  get prop1() { return '' }
  set prop1(val) {}

  /** only getter */
  get prop2() { return '' }

  /** only setter */
  set prop3(val) {}

  /** jsdoc public getter & setter */
  /** @public */
  get prop4() { return '' }
  /** @public */
  set prop4(val) {}

  /** jsdoc private getter & setter */
  /** @private */
  get prop5() { return '' }
  /** @private */
  set prop5(val) {}

  /** jsdoc private getter & setter */
  /** @protected */
  get prop6() { return '' }
  /** @protected */
  set prop6(val) {}

  /** private getter & setter */
  get #prop7() { return '' }
  set #prop7(val) {}

  /** static getter & setter */
  static get prop8() { return '' }
  static set prop8(val) {}

  constructor() {
    super();
    this.prop1 = 'foo';
    this.prop2 = 1;
    this.__onClick = this.__onClick.bind(this); // should not show up as default value
  }

  __onClick();
}

customElements.define('my-element', MyElement);