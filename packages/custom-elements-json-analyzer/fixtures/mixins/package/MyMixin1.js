import { MyMixin2 } from 'foo';

export const MyMixin1 = klass => class MyMixin1 extends MyMixin2(klass) {
  bar = 'bar';
}