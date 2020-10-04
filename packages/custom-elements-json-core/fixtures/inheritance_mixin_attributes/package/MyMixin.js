export const MyMixin = superklass => class MyMixin extends superklass {
  static get observedAttributes() {
    return ['vertical'];
  }
}