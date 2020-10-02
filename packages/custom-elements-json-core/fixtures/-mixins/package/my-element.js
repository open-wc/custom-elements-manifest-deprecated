
const MyMixin1 = klass => class MyMixin1 extends klass {}

export const MyMixin2 = klass => class MyMixin2 extends klass {}

export const MyMixin3 = klass => {
  return class MyMixin3 extends klass{}
}

export function MyMixin4(klass) {
   return class MyMixin4 extends klass{}
}