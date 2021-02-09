import { LitElement } from 'lit-element';
import { ChoiceGroupMixin, FormGroupMixin } from '@lion/form-core';

export class LionRadioGroup extends ChoiceGroupMixin(FormGroupMixin(LitElement)) {}