export const MyMixin = superklass => class MyMixin extends superklass {
  bar = 'bar';

  overRideableMethod(){}
}