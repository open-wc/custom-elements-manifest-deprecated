import { LitElement, html, css } from 'lit-element';

/**
 * @slot container - You can put some elements here
 *
 * @cssprop --text-color - Controls the color of foo
 * @cssproperty --background-color - Controls the color of bar
 *
 * @csspart bar - Styles the color of bar
 */
class MyElement extends LitElement {
  static get styles() {
    return css`
      :host {
        color: var(--text-color, black);
        background-color: var(--background-color, white);
      }
    `;
  }

  static get observedAttributes() {
    return [
      /**
       * @type {boolean} - description
       * @property disabled - corresponding property
       */
      'disabled',
    ];
  }

  constructor() {
    super();
    /** @type {boolean} - disabled state */
    this.disabled = true;
  }

  get disabled() {
    /* etc */
  }
  set disabled(val) {
    /* etc */
  }

  fire() {
    /** @type {FooEvent} foo-event - description */
    this.dispatchEvent(new FooEvent('foo-changed'));
  }

  render() {
    return html`
      <div part="bar"></div>
      <slot name="container"></slot>
    `;
  }
}

/** @type {boolean} - This will show up in the custom-elements.json too */
export const someVariable = true;

customElements.define('my-element', MyElement);