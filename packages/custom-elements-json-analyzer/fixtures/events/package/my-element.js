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

  jsDocEvent() {
    /** @type {JsDocEvent} jsdoc-event - description */
    this.dispatchEvent(new JsDocEvent('jsdoc-event'));
  }

  jsDocEventOnlyDescription() {
    /** only description */
    this.dispatchEvent(new jsDocEventOnlyDescription('jsdoc-event-2'));
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

  notIncluded() {
    this.shadowRoot.querySelector('foo').dispatchEvent(new Event('not-included'));
  }
}

customElements.define('my-element', MyElement);