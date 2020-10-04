import { MyMixin } from './MyMixin.js';

class MyElement extends MyMixin(HTMLElement) {
  fire(){
    this.dispatchEvent(new Event('base'));
  }
}

customElements.define('my-element', MyElement);