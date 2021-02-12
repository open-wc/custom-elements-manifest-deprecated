import { PackageModuleMixin } from 'package-mixin';
import { LocalModuleMixin } from './local.js';

const CurrentModuleMixin = klass => class CurrentModuleMixin extends klass {}
const NestedMixin = klass => class NestedMixin extends LocalModuleMixin(klass) {}


export class PackageElement extends PackageModuleMixin(HTMLElement) {}
export class LocalElement extends LocalModuleMixin(HTMLElement) {}
export class CurrentElement extends CurrentModuleMixin(HTMLElement) {}
export class NestedElement extends NestedMixin(HTMLElement) {}