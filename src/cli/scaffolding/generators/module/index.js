import Generator from 'yeoman-generator';
import path from 'path';

export default class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.argument('name', { type: String, required: true });
  }

  writing() {
    const moduleName = this.options.name;
    const modulePath = `src/extension/modules/${moduleName}`;

    // Index
    this.fs.copyTpl(
      this.templatePath('index.ts.ejs'),
      this.destinationPath(`${modulePath}/index.ts`),
      { name: moduleName, className: this._capitalize(moduleName) }
    );

    // View Index
    this.fs.copyTpl(
      this.templatePath('view/index.ts.ejs'),
      this.destinationPath(`${modulePath}/view/index.ts`),
      { name: moduleName, className: this._capitalize(moduleName) }
    );

    // View Templates
    // Helper to copy template files
    const copyViewTemplate = (subPath) => {
      this.fs.copyTpl(
        this.templatePath(`view/templates/${subPath}.ejs`),
        this.destinationPath(`${modulePath}/view/templates/${subPath}`),
        { name: moduleName, className: this._capitalize(moduleName) }
      );
    };

    copyViewTemplate('index.ts');
    copyViewTemplate('main/index.ts');
    copyViewTemplate('main/html.ts');
    copyViewTemplate('main/css.ts');

    // Background
    this.fs.copyTpl(
      this.templatePath('background/index.ts.ejs'),
      this.destinationPath(`${modulePath}/background/index.ts`),
      { name: moduleName, className: this._capitalize(moduleName) }
    );

    // Backend
    this.fs.copyTpl(
      this.templatePath('backend/index.ts.ejs'),
      this.destinationPath(`${modulePath}/backend/index.ts`),
      { name: moduleName, className: this._capitalize(moduleName) }
    );
  }

  _capitalize(str) {
    return str.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  }
};
