import { SuperClass } from './SuperClass.js';

class MyElement extends SuperClass {
  fire(){
    this.dispatchEvent(new Event('base'));
  }
}

customElements.define('my-element', MyElement);