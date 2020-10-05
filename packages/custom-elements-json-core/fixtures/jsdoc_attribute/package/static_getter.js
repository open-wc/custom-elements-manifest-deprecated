export class MyElement extends HTMLElement {
  static get observedAttributes() {
    return [
    "bar",

    /**
     * @property fieldName
     * @type {boolean}
     */
    "with-fieldName",

    /** some jsdoc */
    "placeholder",

    /** @type {string} - some description */
    "typed-js-doc",

    /** @type {boolean} */
    "disabled",

    "foo"
    ];
  }
}