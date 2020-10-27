/**
 * @attr {boolean} typed-js-doc - THIS WILL OVERRIDE
 */
export class EdgeCase extends HTMLElement {
  static observedAttributes = [
    /** @type {string} - some description */
    "typed-js-doc",
  ];
}