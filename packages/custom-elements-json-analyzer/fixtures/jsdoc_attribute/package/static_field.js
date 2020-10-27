export class MyElement2 extends HTMLElement {
  static observedAttributes = [
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