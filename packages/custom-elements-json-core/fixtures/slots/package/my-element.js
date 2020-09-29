/**
 * @slot - default slot
 * @slot foo - put some divs here
 * @slot bar - put some anchors here
 */
class MyElement extends HTMLElement {}

customElements.define('my-element', MyElement);
