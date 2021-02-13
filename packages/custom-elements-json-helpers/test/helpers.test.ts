import { expect } from 'chai';
import {
  hasModules,
  isClass,
  hasExports,
  hasDeclarations,
  isFunction,
  isVariable,
  hasAttributes,
  hasEvents,
  hasSlots,
  hasMethods,
  hasFields,
  hasMixins,
  isField,
  isMethod,
} from '../src/helpers';
import {
  CustomElement,
  Declaration,
  Export,
  JavaScriptModule,
  Package,
  ClassMember,
} from 'custom-elements-manifest/schema';

describe.skip('helpers', () => {
  describe('PackageDoc', () => {
    describe('hasModules', () => {
      const fixture: Package = {
        schemaVersion: '',
        modules: [{ kind: 'javascript-module', path: '', declarations: [] }],
      };

      it('hasModules - true', () => {
        expect(hasModules(fixture)).to.equal(true);
      });

      it('hasModules - false', () => {
        expect(hasModules({ ...fixture, modules: [] })).to.equal(false);
      });
    });
  });

  describe('ModuleDoc', () => {
    describe('hasExports', () => {
      const fixture: JavaScriptModule = {
        kind: 'javascript-module',
        path: '',
        declarations: [{ kind: 'class', name: '' }],
        exports: [{ kind: 'js', name: '', declaration: { name: '' } }],
      };

      it('hasExports - true', () => {
        expect(hasExports(fixture)).to.equal(true);
      });

      it('hasExports - false', () => {
        expect(hasExports({ ...fixture, exports: [] })).to.equal(false);
      });

      it('hasDeclarations - true', () => {
        expect(hasDeclarations(fixture)).to.equal(true);
      });

      it('hasDeclarations - false', () => {
        expect(hasDeclarations({ ...fixture, declarations: [] })).to.equal(false);
      });
    });
  });

  describe('Declaration', () => {
    describe('isClass', () => {
      const fixture: Declaration = { kind: 'class', name: '' };

      it('isClass - true', () => {
        expect(isClass(fixture)).to.equal(true);
      });

      it('isClass - false', () => {
        expect(isClass({ ...fixture, kind: 'function' })).to.equal(false);
      });
    });

    describe('isFunction', () => {
      const fixture: Export | Declaration = { kind: 'function', name: '' };

      it('isFunction - true', () => {
        expect(isFunction(fixture)).to.equal(true);
      });

      it('isFunction - false', () => {
        expect(isFunction({ ...fixture, kind: 'class' })).to.equal(false);
      });
    });

    describe('isVariable', () => {
      const fixture: Export | Declaration = { kind: 'variable', name: '' };

      it('isVariable - true', () => {
        expect(isVariable(fixture)).to.equal(true);
      });

      it('isVariable - false', () => {
        expect(isVariable({ ...fixture, kind: 'class' })).to.equal(false);
      });
    });
  });

  describe('CustomElementDoc', () => {
    const fixture: CustomElement = {
      tagName: '',
      name: '',
      attributes: [{ name: 'foo' }],
      events: [{ name: 'foo', description: '', type: { text: '' } }],
      slots: [{ name: '' }],
      members: [
        { kind: 'field', name: '' },
        { kind: 'method', name: '' },
      ],
      mixins: [{ name: '' }],
    };

    describe('hasAttributes', () => {
      it('hasAttributes - true', () => {
        expect(hasAttributes(fixture)).to.equal(true);
      });

      it('hasAttributes - false', () => {
        expect(hasAttributes({ ...fixture, attributes: [] })).to.equal(false);
      });
    });

    describe('hasEvents', () => {
      it('hasEvents - true', () => {
        expect(hasEvents(fixture)).to.equal(true);
      });

      it('hasEvents - false', () => {
        expect(hasEvents({ ...fixture, events: [] })).to.equal(false);
      });
    });

    describe('hasSlots', () => {
      it('hasSlots - true', () => {
        expect(hasSlots(fixture)).to.equal(true);
      });

      it('hasSlots - false', () => {
        expect(hasSlots({ ...fixture, slots: [] })).to.equal(false);
      });
    });

    describe('hasFields', () => {
      it('hasFields - true', () => {
        expect(hasFields({ ...fixture, members: [{ kind: 'field', name: '' }] })).to.equal(true);
      });

      it('hasFields - false', () => {
        expect(hasFields({ ...fixture, members: [] })).to.equal(false);
      });
    });

    describe('hasMethods', () => {
      it('hasMethods - true', () => {
        expect(hasMethods({ ...fixture, members: [{ kind: 'method', name: '' }] })).to.equal(true);
      });

      it('hasMethods - false', () => {
        expect(hasMethods({ ...fixture, members: [] })).to.equal(false);
      });
    });

    describe('hasMixins', () => {
      it('hasMixins - true', () => {
        expect(hasMixins(fixture)).to.equal(true);
      });

      it('hasMixins - false', () => {
        expect(hasMixins({ ...fixture, mixins: [] })).to.equal(false);
      });
    });

    describe('isField', () => {
      const fixture: ClassMember = { kind: 'field', name: '' };

      it('isField - true', () => {
        expect(isField(fixture)).to.equal(true);
      });

      it('isField - false', () => {
        expect(isField({ ...fixture, kind: 'method' })).to.equal(false);
      });
    });

    describe('isMethod', () => {
      const fixture: ClassMember = { kind: 'method', name: '' };

      it('isMethod - true', () => {
        expect(isMethod(fixture)).to.equal(true);
      });

      it('isMethod - false', () => {
        expect(isMethod({ ...fixture, kind: 'field' })).to.equal(false);
      });
    });
  });
});
