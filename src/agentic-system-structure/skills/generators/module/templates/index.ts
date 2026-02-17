import { IModule } from '../core/module.js';

export const <%= name %> Module: IModule = {
  id: '<%= name %>',
  label: '<%= className %>',
  icon: 'extension', // TODO: Customize icon
  viewComponent: '<%= name %>-view'
};
