export class SuperClass extends HTMLElement {
  superfire(){
    this.dispatchEvent(new Event('super'));
  }
}