import Generator from 'yeoman-generator';
import path from 'path';

export default class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.argument('name', { type: String, required: false });
    this.argument('description', { type: String, required: false });
  }

  async prompting() {
    if (this.options.name) {
      this.answers = {
        name: this.options.name,
        description: this.options.description || 'A brief description.'
      };
    } else {
      this.answers = await this.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Module name (kebab-case):',
          validate: (input) => /^[a-z0-9-]+$/.test(input) || 'Kebab-case only'
        },
        {
          type: 'input',
          name: 'description',
          message: 'Module description:',
          default: 'A brief description of the module.'
        }
      ]);
    }

    this.answers.camelName = this.answers.name.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    this.answers.pascalName = this.answers.camelName.charAt(0).toUpperCase() + this.answers.camelName.slice(1);
  }

  writing() {
    const destPath = `src/extension/modules/${this.answers.name}`;

    // 1. Root files
    this.fs.copyTpl(
      this.templatePath('index.ts.ejs'),
      this.destinationPath(`${destPath}/index.ts`),
      this.answers
    );
    this.fs.copyTpl(
      this.templatePath('types.d.ts.ejs'),
      this.destinationPath(`${destPath}/types.d.ts`),
      this.answers
    );
    this.fs.copyTpl(
      this.templatePath('constants.ts.ejs'),
      this.destinationPath(`${destPath}/constants.ts`),
      this.answers
    );

    // 2. Background Layer
    this.fs.copyTpl(
      this.templatePath('background/index.ts.ejs'),
      this.destinationPath(`${destPath}/background/index.ts`),
      this.answers
    );

    // 3. Runtime Layer
    this.fs.copyTpl(
      this.templatePath('runtime/index.ts.ejs'),
      this.destinationPath(`${destPath}/runtime/index.ts`),
      this.answers
    );

    // 4. Template Layer
    this.fs.copyTpl(
      this.templatePath('templates/index.ts.ejs'),
      this.destinationPath(`${destPath}/templates/index.ts`),
      this.answers
    );

    // Create folders for UI fragmentation
    this.fs.write(`${destPath}/templates/host/html/.gitkeep`, '');
    this.fs.write(`${destPath}/templates/host/css/.gitkeep`, '');
  }
};
