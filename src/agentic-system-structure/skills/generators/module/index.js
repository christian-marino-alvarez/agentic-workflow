const Generator = require('yeoman-generator');
const path = require('path');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.argument('name', { type: String, required: true });
  }

  writing() {
    const moduleName = this.options.name;
    const modulePath = `src/extension/modules/${moduleName}`;

    // Index
    this.fs.copyTpl(
      this.templatePath('index.ts'),
      this.destinationPath(`${modulePath}/index.ts`),
      { name: moduleName, className: this._capitalize(moduleName) }
    );

    // View
    this.fs.copyTpl(
      this.templatePath('view/index.ts'),
      this.destinationPath(`${modulePath}/view/index.ts`),
      { name: moduleName, className: this._capitalize(moduleName) }
    );
    this.fs.copyTpl(
      this.templatePath('view/view.ts'),
      this.destinationPath(`${modulePath}/view/${moduleName}-view.ts`),
      { name: moduleName, className: this._capitalize(moduleName) }
    );

    // Backend
    this.fs.copyTpl(
      this.templatePath('backend/service.ts'),
      this.destinationPath(`${modulePath}/backend/service.ts`),
      { name: moduleName, className: this._capitalize(moduleName) }
    );
  }

  _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
};
