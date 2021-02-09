const LinkMixinImplementation = superclass =>
  class extends superclass {
    static get properties() {
      return {
        href: String,
        target: String,
      };
    }
  }