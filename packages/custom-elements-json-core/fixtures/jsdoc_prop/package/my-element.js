/**
 * @prop {boolean} prop1 - some description
 * @property {number} prop2 - some description
 * @property {string} prop3 - some description
 * @property {Array} prop4 - some description
 * @property {Object} prop5 - some description
 * @property {Object} prop6 - jsdoc only
 */
export class MyElement extends HTMLElement {
  prop1;
  prop2;

  static properties = {
    prop4: {type: Array}
  }

  static get properties() {
    return {
      prop5: {type: Object}
    }
  }

  constructor() {
    super();
    this.prop1 = 'foo';
    this.prop5 = 'bar';
  }

  get prop3(){}
}