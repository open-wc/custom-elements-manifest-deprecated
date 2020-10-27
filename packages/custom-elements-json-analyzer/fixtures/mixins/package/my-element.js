import { MyMixin1 } from './MyMixin1.js';

export class MyElement extends MyMixin1(HTMLElement) {
  foo = 'foo';
}

// export const MyMixin2 = klass => class MyMixin2 extends MyMixin3(MyMixin1(klass)) {}
// export const MyMixin3 = klass => {
//   return class MyMixin3 extends klass{}
// }

// export function MyMixin4(klass) {
//    return class MyMixin4 extends klass{}
// }