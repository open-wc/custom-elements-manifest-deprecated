const MyMixin = klass => class MyMixin extends klass {}
const MyMixin1 = klass => { return class MyMixin1 extends klass{} }
function MyMixin2(klass, foo: string = '1') { return class MyMixin2 extends klass{} }

/**
 * 
 * @param {*} klass 
 * @param {string} foo 
 */
export function MyMixin3(klass, foo) { return class MyMixin3 extends klass{} }

/**
 * 
 * @param {*} klass 
 * @param {string} foo 
 */
export const MyMixin4 = (klass, foo) => { return class MyMixin4 extends klass{} }

export class MyElement extends MyMixin(HTMLElement) {}
export class MyElement1 extends MyMixin1(HTMLElement) {}
export class MyElement2 extends MyMixin2(HTMLElement) {}
export class MyElement3 extends MyMixin3(HTMLElement) {}
export class MyElement4 extends MyMixin4(HTMLElement) {}
