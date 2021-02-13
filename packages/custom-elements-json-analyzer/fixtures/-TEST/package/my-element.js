

export const MyMixin = klass => class extends klass {}

// const MyMixin1 = klass => { return class MyMixin1 extends Klass{} }
// function MyMixin2(klass, foo: string = '1') { return class MyMixin2 extends Klass{} }

// /**
//  * 
//  * @param {*} klass 
//  * @param {string} foo 
//  */
// export function MyMixin3(klass, foo) { return class MyMixin3 extends Klass{} }

// /**
//  * 
//  * @param {*} klass 
//  * @param {string} foo 
//  */
// export const MyMixin4 = (klass, foo) => { return class MyMixin4 extends Klass{} }

// export class MyElement extends MyMixin(HTMLElement) {}
// export class MyElement1 extends MyMixin1(HTMLElement) {}
// export class MyElement2 extends MyMixin2(HTMLElement) {}
// export class MyElement3 extends MyMixin3(HTMLElement) {}
// export class MyElement4 extends MyMixin4(HTMLElement) {}


// import { LitElement } from 'lit-element';
// import { LocalizeMixin } from 'lion';

// /**
//  * @fires {SuperCustomEvent} custom-event - this is custom
//  */
// export class SuperClass extends LitElement {
//   superClassMethod() {}
// }
// const Mixin = klass => class Mixin extends klass {
//   /** @protected */
//   mixinProp = 1;
// }

// /**
//  * @slot container - You can put some elements here
//  *
//  * @cssproperty --background-color - Controls the color of bar
//  *
//  * @csspart bar - Styles the color of bar
//  * 
//  */
// class MyElement extends LocalizeMixin(Mixin(SuperClass)) {
//   static get properties() {
//     return {
//       prop1: { type: Boolean, attribute: 'prop-1'},
//       prop2: { type: Boolean, reflect: true },
//       prop3: { type: Boolean, attribute: false }
//     }
//   }

export class MyElement extends MyMixin(HTMLElement) {}
export class MyElement1 extends MyMixin1(HTMLElement) {}
export class MyElement2 extends MyMixin2(HTMLElement) {}
export class MyElement3 extends MyMixin3(HTMLElement) {}
export class MyElement4 extends MyMixin4(HTMLElement) {}


// import { LitElement } from 'lit-element';
// import { LocalizeMixin } from 'lion';

// /**
//  * @fires {SuperCustomEvent} custom-event - this is custom
//  */
// export class SuperClass extends LitElement {
//   superClassMethod() {}
// }
// const Mixin = klass => class Mixin extends klass {
//   /** @protected */
//   mixinProp = 1;
// }

// /**
//  * @slot container - You can put some elements here
//  *
//  * @cssproperty --background-color - Controls the color of bar
//  *
//  * @csspart bar - Styles the color of bar
//  * 
//  */
// class MyElement extends LocalizeMixin(Mixin(SuperClass)) {
//   static get properties() {
//     return {
//       prop1: { type: Boolean, attribute: 'prop-1'},
//       prop2: { type: Boolean, reflect: true },
//       prop3: { type: Boolean, attribute: false }
//     }
//   }

//   /**
//    * @private
//    * @type {string} - description goes here
//    */
//   foo = 'bar';

//   /**
//    * Some description of the method here
//    * @public
//    * @param {Event} e 
//    * @param {String} a - some description
//    * @return void
//    */
//   instanceMethod(e, a) {
//     this.dispatchEvent(new Event('my-event'));
//   }

//   constructor() {
//     super();
//     /** @type {boolean} */
//     this.prop3 = true;
//   }
// }

// customElements.define('my-element', MyElement);

// /** @type {boolean} - this is a var export */
// export const variableExport = true;
// /** @type {string} - this is a string var export */
// export const stringVariableExport = 'foo';


// /**
//  * This is a function export
//  * @param {string} a 
//  * @param {boolean} b 
//  * @return {boolean}
//  */
// export function functionExport(a, b) {}