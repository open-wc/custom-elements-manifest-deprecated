import { expect } from 'chai';
import { CustomElementsJson } from '../src/index';

// const default_fixture = { schemaVersion: '', modules: []};
const default_fixture = require('../fixtures/default.json');
const many_classes_and_superclasses = require('../fixtures/many_classes_and_superclasses.json');

describe('CustomElementsJson', () => {
  it('instantiates', () => {
    const customElementsJson = new CustomElementsJson(default_fixture);
    // expect(customElementsJson.json).to.equal(default_fixture);
  });

  // describe('getByTagName', () => {
  //   it('getByTagName', () => {
  //     const customElementsJson = new CustomElementsJson(many_classes_and_superclasses);
  //     expect(customElementsJson.getByTagName('c-c').name).to.equal('C');
  //     expect(customElementsJson.getByTagName('c-c').tagName).to.equal('c-c');

  //     expect(customElementsJson.getByTagName('a-a').name).to.equal('A');
  //     expect(customElementsJson.getByTagName('a-a').tagName).to.equal('a-a');
  //   });
  // });

  // describe('getByClassName', () => {
  //   it('getByClassName', () => {
  //     const customElementsJson = new CustomElementsJson(many_classes_and_superclasses);
  //     expect(customElementsJson.getByClassName('C').name).to.equal('C');
  //     expect(customElementsJson.getByClassName('C').tagName).to.equal('c-c');

  //     expect(customElementsJson.getByClassName('A').name).to.equal('A');
  //     expect(customElementsJson.getByClassName('A').tagName).to.equal('a-a');
  //   });

  //   it('getByClassName - gets a superclass', () => {
  //     const customElementsJson = new CustomElementsJson(many_classes_and_superclasses);
  //     expect(customElementsJson.getByClassName('SuperB').name).to.equal('SuperB');
  //     expect(customElementsJson.getByClassName('SuperB').members!.length).to.equal(1);
  //   });
  // });

  // describe('getClasses', () => {
  //   it('getClasses - gets all classes', () => {
  //     const customElementsJson = new CustomElementsJson(many_classes_and_superclasses);
  //     expect(customElementsJson.getClasses().length).to.equal(4);
  //   });
  // });

  // describe('getDefinitions', () => {
  //   it('getDefinitions - gets all definitions', () => {
  //     const customElementsJson = new CustomElementsJson(many_classes_and_superclasses);
  //     expect(customElementsJson.getDefinitions().length).to.equal(2);
  //   });
  // });

  // describe('getMixins', () => {
  //   const multiple_mixins = require('../fixtures/multiple_mixins.json');

  //   it('getMixins - gets all mixins', () => {
  //     const customElementsJson = new CustomElementsJson(multiple_mixins);
  //     expect(customElementsJson.getMixins().length).to.equal(2);
  //   });
  // });

  // describe('getInheritanceTree', () => {
  //   const only_superclasses = require('../fixtures/inheritance/only_superclasses/custom-elements.json');
  //   const superclasses_and_mixins = require('../fixtures/inheritance/superclasses_and_mixins/custom-elements.json');

  //   it('getInheritanceTree - gets all superclasses', () => {
  //     const customElementsJson = new CustomElementsJson(only_superclasses);

  //     expect(customElementsJson.getInheritanceTree('MyComponent').length).to.equal(3);
  //     expect(customElementsJson.getInheritanceTree('MyComponent')[0].name).to.equal('MyComponent');
  //     expect(customElementsJson.getInheritanceTree('MyComponent')[1].name).to.equal('LitElement');
  //     expect(customElementsJson.getInheritanceTree('MyComponent')[2].name).to.equal('UpdatingElement');
  //   });

  //   it('getInheritanceTree - gets all superclasses and mixins', () => {
  //     const customElementsJson = new CustomElementsJson(superclasses_and_mixins);

  //     expect(customElementsJson.getInheritanceTree('MyComponent').length).to.equal(5);
  //     expect(customElementsJson.getInheritanceTree('MyComponent')[0].name).to.equal('MyComponent');
  //     expect(customElementsJson.getInheritanceTree('MyComponent')[1].name).to.equal('TabindexMixin');
  //     expect(customElementsJson.getInheritanceTree('MyComponent')[2].name).to.equal('LocalizeMixin');
  //     expect(customElementsJson.getInheritanceTree('MyComponent')[3].name).to.equal('LitElement');
  //     expect(customElementsJson.getInheritanceTree('MyComponent')[4].name).to.equal('UpdatingElement');
  //   });

  //   it('getInheritanceTree - returns empty array if class not found', () => {
  //     const customElementsJson = new CustomElementsJson(only_superclasses);
  //     expect(customElementsJson.getInheritanceTree('AsdfAsdf').length).to.equal(0);
  //   });
  // });
});
