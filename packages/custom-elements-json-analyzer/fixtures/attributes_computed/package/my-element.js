class MyElement extends HTMLElement {
  static get observedAttributes() {
    const attributes = TwitchChat.attributes;
    return Object.keys(attributes).filter(attr => {
        return typeof attributes[attr].watch === 'undefined' || attributes[attr].watch;
    });
  }
}

customElements.define('my-element', MyElement);