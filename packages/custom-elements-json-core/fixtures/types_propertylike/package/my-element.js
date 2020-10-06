export class MyElement extends HTMLElement {
  foo: string;
  bar: {a:'a',b:'b'};
  baz: Array<Foo|Bar>;

  constructor() {
    super();
    this.foo = 'foo';
    /** @type {Object} */ // should not override the ts type
    this.bar = {a:'a',b:'b'};
    /** @type {string} - description */
    this.jsdoc1 = '';
    /** @type {boolean} - description2 */
    this.jsdoc2 = false;
    /** @type {boolean} */
    this.jsdoc3 = true;
    /** only description */
    this.jsdoc4 = 1;
    /** @type {import('foo').ImportedType} */
    this.jsdoc5 = 1;
  }
  get jsdoc1(){}
  get jsdoc2(){}
  get jsdoc3(){}
  get jsdoc4(){}
  get jsdoc5(){}
}