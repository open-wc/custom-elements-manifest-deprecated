import { Package, JavaScriptModule, Export, Declaration, CustomElementExport, ClassDeclaration, CustomElement, VariableDeclaration, Reference } from 'custom-elements-json/schema';
import * as h from './helpers';

export class CustomElementsJson {
  schemaVersion: string;
  readme: string;
  modules: JavaScriptModule[];
  #classes = new Map();
  #tagNames = new Map();
  #definitions = new Map();
  #mixins = new Map();

  #initialized = false;

  constructor({
    schemaVersion,
    readme,
    modules,
  }: Package = {
    schemaVersion: 'experimental',
    readme: '',
    modules: []
  }) {
    this.schemaVersion = schemaVersion;
    this.readme = <string>readme;
    this.modules = modules;
  }

  private loopAll(cb: (_export: Export|Declaration) => void) {
    this.modules.forEach((_module: JavaScriptModule) => {
      if(h.hasExports(_module)) {
        _module.exports!.forEach((_export: Export) => {
          cb(_export);
        });
      }

      if(h.hasDeclarations(_module)) {
        _module.declarations!.forEach((declaration: Declaration) => {
          cb(declaration);
        });
      }
    });
  }

  reset() {
    this.modules = [];
    this.#classes = new Map();
    this.#tagNames = new Map();
    this.#definitions = new Map();
    this.#mixins = new Map();
    this.#initialized = false;
  }

  private init() {
    this.#initialized = true;

    this.loopAll((item: Export|Declaration) => {
      if(h.isClass(item)) {
        this.#classes.set(item.name, item);
      }
    });

    this.loopAll((item: Export|Declaration) => {
      if(h.isCustomElementExport(item)) {
        this.#tagNames.set(item.name, this.#classes.get((item as CustomElementExport).declaration.name));

        // get all CustomElementExports
        this.#definitions.set(item.name, item);
      }
    });
  }

  getByTagName(tagName: string): CustomElement {
    return this.#tagNames.get(tagName);
  }

  getByClassName(className: string): CustomElement {
    return this.#classes.get(className);
  }

  /** Gets all classes from declarations */
  getClasses(){
    if(this.#initialized === false) {
      this.init();
      this.#initialized = true;
    }
    const classes = [];
    for(let[_, val] of this.#classes) {
      classes.push(val);
    }
    return classes;
  }

  /** Gets registered custom elements, so elements that have customElements.define called, returns class including tagName */
  getTagNames(){
    if(!this.#initialized) {
      this.init();
      this.#initialized = true;
    }
    const definitions = [];
    for(let[_, val] of this.#tagNames) {
      definitions.push(val);
    }
    return definitions;
  }

  /** Gets all CustomElementDefinitions */
  getDefinitions() {
    if(!this.#initialized) {
      this.init();
      this.#initialized = true;
    }
    const definitions = [];
    for(let[_, val] of this.#definitions) {
      definitions.push(val);
    }

    return definitions;
  }


  // private initMixins() {
  //   let foundMixins = new Map();

  //   let _mixins: Reference[] = [];
  //   this.loopAllExports((_export) => {
  //     if (h.hasMixins(_export as CustomElement)) {
  //       const { mixins } = _export as CustomElement;

  //       [...<Reference[]>mixins].forEach((mixin) => {
  //         foundMixins.set(mixin.name, mixin);
  //       });
  //     }
  //   });

  //   this.loopAllExports((_export) => {
  //     if (h.isVariable(_export as Variable)) {
  //       const mergedMixin = {
  //         ...foundMixins.get(_export.name),
  //         ..._export
  //       };

  //       _mixins.push(mergedMixin);
  //     }
  //   });

  //   [...new Set([..._mixins])].forEach((mixin) => {
  //     this.mixins.set(mixin.name, mixin);
  //   });
  // }


  // getMixins(){
  //   const mixins = [];
  //   for(let[key, val] of this.mixins) {
  //     mixins.push(val);
  //   }
  //   return mixins;
  // }


  // getInheritanceTree(className: string) {
  //   const tree: Class[] = [];

  //   let klass = this.classes.get(className);

  //   if(klass) {
  //     tree.push(klass);

  //     if(h.hasMixins(klass)) {
  //       klass.mixins.forEach((mixin: Variable) => {
  //         tree.push(this.mixins.get(mixin.name));
  //       });
  //     }

  //     while(this.classes.has(klass.superclass.name)) {
  //       const newKlass = this.classes.get(klass.superclass.name)

  //       if(h.hasMixins(newKlass)) {
  //         newKlass.mixins.forEach((mixin: Variable) => {
  //           tree.push(this.mixins.get(mixin.name));
  //         });
  //       }

  //       tree.push(newKlass);
  //       klass = newKlass;
  //     }

  //     return tree;
  //   } else {
  //     return [];
  //   }

  // }
}

// const default_fixture = require('../fixtures/default.json');
// const customElementsJson = new CustomElementsJson(default_fixture);

export * from './helpers';
