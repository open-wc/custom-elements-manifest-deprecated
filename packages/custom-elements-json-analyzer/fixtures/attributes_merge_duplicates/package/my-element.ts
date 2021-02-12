/**
 * @attr type - Determines the style, can be "info", "warning", or "error". Default is "info"
 * @attr corner - Determines if banner sets position at upper right corner or not.
 * @attr foo - Determines if foo
 */
export class Banner extends SpectrumElement {
  @property({ reflect: true, type: String })
  public type: 'info' | 'warning' | 'error' = 'info';

  @property({ reflect: true, type: Boolean })
  public corner = false;

  static get properties() {
    return {
      foo: {
        reflect: true,
        type: Boolean
      }
    }
  }
}