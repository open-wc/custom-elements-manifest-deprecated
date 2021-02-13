import {
  JavaScriptModule,
  Declaration,
  Package,
  Export,
  CustomElement,
  ClassMember,
} from 'custom-elements-manifest/schema';

/** Package */
export function hasModules(_package: Package): boolean {
  return Array.isArray(_package?.modules) && _package?.modules.length > 0;
}

/** JavaScriptModule */
export function hasExports(_module: JavaScriptModule): boolean {
  return Array.isArray(_module?.exports) && _module?.exports.length > 0;
}

export function hasDeclarations(_module: JavaScriptModule): boolean {
  return Array.isArray(_module?.declarations) && _module?.declarations.length > 0;
}

export function isJavaScriptModule(_module: JavaScriptModule): boolean {
  return _module.kind === 'javascript-module';
}

/** Exports */
export function isCustomElementExport(_export: Declaration | Export): boolean {
  return _export.kind === 'custom-element-definition';
}

export function isJavaScriptExport(_export: Export): boolean {
  return _export.kind === 'js';
}

/** Declarations */
export function isClass(item: Declaration | Export): boolean {
  return item.kind === 'class';
}

export function isMixin(item: Declaration | Export): boolean {
  return item.kind === 'mixin';
}

export function isFunction(item: Declaration | Export): boolean {
  return item.kind === 'function';
}

export function isVariable(item: Declaration | Export): boolean {
  return item.kind === 'variable';
}

/** CustomElement */
export function hasAttributes(customElement: CustomElement): boolean {
  return Array.isArray(customElement?.attributes) && customElement?.attributes.length > 0;
}

export function hasEvents(customElement: CustomElement): boolean {
  return Array.isArray(customElement?.events) && customElement?.events.length > 0;
}

export function hasSlots(customElement: CustomElement): boolean {
  return Array.isArray(customElement?.slots) && customElement?.slots.length > 0;
}

export function hasMethods(customElement: CustomElement): boolean {
  return (
    Array.isArray(customElement?.members) &&
    customElement?.members.length > 0 &&
    customElement?.members.some(member => member.kind === 'method')
  );
}

export function hasFields(customElement: CustomElement): boolean {
  return (
    Array.isArray(customElement?.members) &&
    customElement?.members.length > 0 &&
    customElement?.members.some(member => member.kind === 'field')
  );
}

export function hasMixins(customElement: CustomElement): boolean {
  return Array.isArray(customElement?.mixins) && customElement?.mixins.length > 0;
}

/** ClassMember */
export function isField(member: ClassMember): boolean {
  return member.kind === 'field';
}

export function isMethod(member: ClassMember): boolean {
  return member.kind === 'method';
}
