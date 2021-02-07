class MyElement extends HTMLElement {
  // /**
  //  * @param {Object} opts
  //  * @param {string} opts.currency
  //  */
  // _onCurrencyChanged({ currency }) {}

  foo({bar, baz}){}

  /**
   * @param {{
   *   a: string,
   *   b: Number
   * }} obj 
   */
  bar({a,b}) {}
}

customElements.define('my-element', MyElement);