# Introducing Custom Elements Manifest

The idea for a `web-components.json` was first suggested in
this [GitHub issue](https://github.com/w3c/webcomponents/issues/776) on the web components GitHub repository, by Pine from the VS Code team, with the initial goal for IDEs to be able to better support custom elements.

![octref](./octref.gif)

Developers tend to have many differing opinions, and standardization tends to... take time. More than 2 years later, we are happy to finally be able to share with you: _Custom Elements Manifest_ 🎉

Custom Elements Manifest is a file format that describes the custom elements in your project. This format will allow tooling and IDEs to give rich information about the custom elements in a given project. A `custom-elements.json` contains metadata about the custom elements in your project; their properties, methods, attributes, inheritance, slots, CSS Shadow Parts, CSS custom properties, and a modules exports.

## Example

Here's an example:

```js
import { LitElement } from 'lit-element';

/**
 * My custom element
 * @slot container - Contains light dom children
 */
class MyElement extends LitElement {
  static get properties() {
    return {
      disabled: { type: Boolean },
    };
  }

  fire() {
    this.dispatchEvent(new Event('disabled-changed'));
  }

  render() {
    return html`<slot name="container"></slot>`;
  }
}
```

> Note that this example uses LitElement, but Custom Elements Manifest is not strictly tied, or exclusive to LitElement. Other libraries (or no libraries!), like Stencil, can also be documented using the Custom Elements Manifest schema.

Will result in the following `custom-elements.json`:

```json
{
  "schemaVersion": "experimental",
  "readme": "",
  "modules": [] //TODO
}
```

## Usecases

Why Custom Elements Manifest?

### Documentation and demos

Documentation viewers should be able to display all the relevant information about a custom element, such as its tag name, attributes, properties, definition module, CSS variables and parts, etc.

![apiviewer](./apiviewer.gif)

> [`api-viewer-element`](https://github.com/web-padawan/api-viewer-element) by [Serhii Kulykov](https://twitter.com/serhiikulykov)

Using a `custom-elements.json` file, it would be easy to generate or display demos for your component using tools such as [api-viewer-element](https://github.com/web-padawan/api-viewer-element), or automatically generate [Storybook](https://storybook.js.org/) knobs for your components. [11ty](https://www.11ty.dev/) plugins could be created to automatically create your documentation sites for you.

### Framework Integration

React currently is the only major framework where [custom elements require some special handling](https://custom-elements-everywhere.com/). React will pass all data to a custom element in the form of HTML attributes, and cannot listen for DOM events coming from Custom Elements without the use of a workaround.

The solution for this is to create a wrapper React component that handles these things. Using a `custom-elements.json` file, creation of these wrapper components could be automated.

Some component libraries like [Fast](http://fast.design/) or [Shoelace](https://shoelace.style/) provide specific instructions on how to integrate with certain frameworks. Automating this integration layer could make development easier for both authors of component libraries, but also for consumers of libraries.

### Avoiding breaking API changes in minor or patch versions

Another interesting usecase, inspired by [`elm-package`](https://github.com/elm-lang/elm-package#elm-package), is that tooling could be able to detect whether or not the public API of a custom element has changed, based on a snapshot of the current `custom-elements.json` file to decide the impact of an update, and potentially prevent breaking API change in patch or minor versions.

### Linting

Linters will be able to give accurate contextual information about your custom element. Are you setting an attribute on a custom element that is not supported? Are you adding an event listener to a custom element that it doesn't fire? With the use of `custom-elements.json`, linters will be able to warn you, and catch mistakes early.

### Cataloging

A major usecase of `custom-elements.json` is that it allows us to reliably detect NPM packages that for certain contain custom elements. These packages could be stored, and displayed on a custom elements catalog, effectively a potential reboot of webcomponents.org. This catalog would be able to show rich demos and documentation of the custom elements contained in a package, by importing its components from a CDN like unpkg, and its `custom-elements.json` file.

### Much, much more!

We believe `custom-elements.json` will open the door for a lot, lot more new exciting ideas and tooling. Which usecases can _you_ come up with? Do you have an idea, but are unsure where to start? Feel free to reach out to us on the [Polymer Slack](https://www.polymer-project.org/slack-invite), we're always happy to have a chat and help you get started.

## 🛠 The Tools

It's unlikely that developers will write their `custom-elements.json` file by hand. So at [open-wc](http://open-wc.org/), we worked hard on a tool that does it for you!

## `@custom-elements-json/analyzer`

[`@custom-elements-json/analyzer`](TODO) will scan the source files in your project, and generate a `custom-elements.json` for you.

Here's how you can use it today:

```bash
npx custom-elements-json analyze
```

Currently, `@custom-elements-json/analyzer` supports vanilla custom elements (in both JavaScript and TypeScript), and has a special handling for [LitElement](http://lit-element.polymer-project.org/). In the future, this could be extended to support additional libraries like [Stencil](https://stenciljs.com/) and others as well. If you'd like to request support for a library, or if you'd like to implement support for a library, please create an issue on the [GitHub repository](TODO), or reach out on the [Polymer Slack](https://www.polymer-project.org/slack-invite).

It's still very early days for `@custom-elements-json/analyzer`, and we're still ironing out all usecases and bugs, so feel free to try it out and let us know on [GitHub](TODO) if you run into anything weird!

## `@custom-elements-json/helpers`

If you're a developer thats interested in creating tooling with `custom-elements.json`, we've also got you covered!

[`@custom-elements-json/helpers`](TODO) is a library of helpers that help you easily extract information from a `custom-elements.json` file, like for example:

- Getting all classes
- Getting a class's inheritance chain
- Getting custom elements by tagname
- Getting custom elements by class name
- Many more

Here's an example of how you can use `@custom-elements-json/helpers` in your projects:

```js
// Node
import { CustomElementsJson } from '@custom-elements-json/helpers';

const json = JSON.parse(fs.readFileSync('./custom-elements.json', 'utf-8'));
const customElementsJson = new CustomElementsJson(json);

// Browser
import { CustomElementsJson } from 'https://unpkg.com/@custom-elements-json/helpers/dist/esm/index.js';

const json = await (await fetch('./custom-elements.json')).json();
const customElementsJson = new CustomElementsJson(json);
```

Additionally, `@custom-elements-json/helpers` ships with a bunch of helper functions to help you develop custom tooling for `custom-elements.json`, and make your code more declarative.

```js
import * as h from '@custom-elements-json/helpers';

const json = require('./custom-elements.json');

if (h.hasModules(json)) {
  json.modules.forEach(_module => {
    if (h.hasExports(_module)) {
      _module.exports.forEach(_export => {
        if (h.isClass(_export) && h.hasAttributes(_export)) {
          const attrs = _export.attributes;
          // do something with attributes
        }
      });
    }
  });
});
```

## More than custom elements alone

vaadin router example, or another generic js library
maybe a preact example?
