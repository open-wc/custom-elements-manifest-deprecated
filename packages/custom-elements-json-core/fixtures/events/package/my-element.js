const bar = new CustomEvent('custom-event3', {detail: {}});

/**
 * @fires custom-event - some description for custom-event
 * @fires {Event} jsdoc-event - some description for jsdoc-event
 * @event {CustomEvent} event-event - some description for event-event
 */
class MyElement extends HTMLElement {
  normalEvent() {
    this.dispatchEvent(new Event('normal-event'));
  }

  customEvent() {
    this.dispatchEvent(new CustomEvent('custom-event', {detail: {}}));
  }

  customEvent2() {
    const foo = new CustomEvent('custom-event2', {detail: {}});
    this.dispatchEvent(foo);
  }

  customEvent3() {
    this.dispatchEvent(bar);
  }

  extendedEvent() {
    this.dispatchEvent(new ExtendedEvent('extended-event', {detail: {}}));
  }
}

customElements.define('my-element', MyElement);