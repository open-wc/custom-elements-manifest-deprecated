/**
 * @tag my-element
 */
export class MyElement extends HTMLElement {}

/**
 * @tagname my-element2
 */
export class MyElement2 extends HTMLElement {}

/**
 * @tagName my-element3
 */
export class MyElement3 extends HTMLElement {}

/**
 * Should take precedence over customElements.define call
 * @tag i-win
 */
export class MyElement4 extends HTMLElement {}

customElements.define('i-lose', MyElement4);