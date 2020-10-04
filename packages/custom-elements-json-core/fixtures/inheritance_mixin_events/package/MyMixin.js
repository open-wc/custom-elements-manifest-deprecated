export const MyMixin = superclass => class MyMixin extends superclass {
  superfire(){
    this.dispatchEvent(new Event('super'));
  }
}