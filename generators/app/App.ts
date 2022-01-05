import * as _ from "lodash";
import * as Generator from "yeoman-generator";

import askName = require("inquirer-npm-name");
const extend = require('deep-extend');
import inquirer = require("inquirer");
import mkdirp = require("mkdirp");
import path = require("path");

import { AppAnswers } from "./AppAnswers";
import { AppOptions } from "./AppOptions";
import { TemplatesSpec, Utils } from "../utils/Utils";

export class App extends Generator {

  options: AppOptions = new AppOptions();
  answers: AppAnswers = new AppAnswers();

  public constructor(args: string[], opts: AppOptions) {
    super(args, opts);

    this.option('travis', { type: Boolean, description: "Include travis config", default: true });
    this.option('coveralls', { type: Boolean, description: "Include coveralls config", });
    this.option('editorconfig', { type: Boolean, description: "Include editorconfig config", default: true });
    this.option('license', { type: Boolean, description: "Include license config", default: true });
    this.option('githubAccount', { type: String, description: "GitHub username or organization", });
    this.option('repositoryName', { type: String, description: "Name of the GitHub repository", });
    this.option('readme', { type: String, description: "Content to insert in the README.md file", });
  }

  public async prompting() {

    const result = await askName(
      {
        name: 'name',
        message: 'Your generator name',
        default: Utils.makeGeneratorName(path.basename(process.cwd())),
        filter: Utils.makeGeneratorName,
        validate: str => {
          return str.length > 'generator-'.length;
        }
      },
      inquirer
    );

    this.options.name = result.name;
    Object.assign(this.options, Utils.parseScopedName(result.name));

    this.answers = await this.prompt<AppAnswers>(
      [{
        type: 'list',
        name: "language",
        message: "Your favourite programming language",
        choices: [{
          name: 'C#',
          value: ['c#', 'C#', 'csharp', 'CSharp']
        },
        {
          name: 'TypeScript',
          value: ['ts', 'TS', 'TypeScript']
        }
        ]
      }]
    );

    this.log(`You favourite language is ${this.answers.language ?? 'N/A'}.`);
  }

  public async default() {

    if (path.basename(this.destinationPath()) !== this.options.localName) {
      this.log(
        `Your generator must be inside a folder named ${this.options.localName}\nI'll automatically create this folder.`
      );
      await mkdirp(this.options.localName);
      this.destinationRoot(this.destinationPath(this.options.localName));
    }

    const readmeTpl = _.template(this.fs.read(this.templatePath('README.md')));

    const options = {
      travis: this.options.travis,
      coveralls: this.options.coveralls,
      editorconfig: this.options.editorconfig,
      license: this.options.license,
      name: this.options.name,
      githubAccount: this.options.githubAccount,
      repositoryName: this.options.repositoryName,
      projectRoot: 'generators',
      readme: readmeTpl({
        generatorName: this.options.name,
        yoName: this.options.name.replace('generator-', '')
      }),
      skipInstall: this.options['skip-install'],
    }

    this.composeWith(require.resolve('@springcomp/generator-ts/generators/app'), options);
  }

  public writing() {

    const pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    const generatorGeneratorPkg = require('../../package.json');

    var _boilerplate_files = 'cp README.md ./dist/';
    if (this.options.license) {
      _boilerplate_files = 'cp LICENSE ./dist/ && cp README.md ./dist/';
    }

    extend(pkg, {
      main: 'generators/app/index.js',
      scripts: {
        'build': 'tsc --project . --outDir ./dist/generators/',
        'clean': 'rm -rf ./dist/',
        'install': 'npm run build && npm run _app_template_files && npm run _boilerplate-files && npm run _clear-package-json',
        '_app_template_files': 'npm run _app_templates_folder && cp -r generators/app/templates/* ./dist/generators/app/templates/',
        '_app_templates_folder': 'node_modules/.bin/mkdirp -p ./dist/generators/app/templates ',
        '_boilerplate-files': `${_boilerplate_files}`,
        '_clear-package-json': 'cp package.json ./dist/',
      },
      dependencies: {
        '@springcomp/generator-ts': generatorGeneratorPkg.dependencies['@springcomp/generator-ts'],
        'chalk': generatorGeneratorPkg.dependencies.chalk,
        'deep-extend': generatorGeneratorPkg.dependencies['deep-extend'],
        'inquirer-npm-name': generatorGeneratorPkg.dependencies['inquirer-npm-name'],
        'mkdirp': generatorGeneratorPkg.dependencies['mkdirp'],
        'yeoman-generator': generatorGeneratorPkg.dependencies['yeoman-generator'],
        'yosay': generatorGeneratorPkg.dependencies.yosay,
      },
      devDependencies: {
        '@types/inquirer': generatorGeneratorPkg.devDependencies['@types/inquirer'],
        '@types/inquirer-npm-name': generatorGeneratorPkg.devDependencies['@types/inquirer-npm-name'],
        '@types/lodash': generatorGeneratorPkg.devDependencies['@types/lodash'],
        '@types/mkdirp': generatorGeneratorPkg.devDependencies['@types/mkdirp'],
        '@types/yeoman-generator': generatorGeneratorPkg.devDependencies['@types/yeoman-generator'],
        'clean-publish': generatorGeneratorPkg.devDependencies['clean-publish'],
        'yeoman-test': generatorGeneratorPkg.devDependencies['yeoman-test'],
        'yeoman-assert': generatorGeneratorPkg.devDependencies['yeoman-assert']
      },
      jest: {
        testPathIgnorePatterns: ['templates']
      }
    });

    // using `as any` type casting to access keywords
    // I'm not sure if there is a better way :-(

    var __json: any = pkg;

    __json.keywords = __json.keywords || [];
    __json.keywords.push('yeoman-generator');

    this.fs.writeJSON(this.destinationPath('package.json'), pkg);

    // writing template files

    const yoName = this.options.name.replace('generator-', '');

    const files: TemplatesSpec = {
      'generators/Options.ts': { options: { namespace: yoName, } },
      'generators/app/App.ts': {},
      'generators/app/AppAnswers.ts': {},
      'generators/app/AppOptions.ts': {},
      'generators/app/index.ts': {},
      'generators/utils/Utils.ts': {},
      'README.md': {},
    };

    Utils.copyTemplates(this, files);

    const templates: TemplatesSpec = {
      'generators/Options.ts': { destinationPath: 'generators/app/templates/generators/Options.ts' },
      'generators/app/App.ts': { destinationPath: 'generators/app/templates/generators/app/App.ts' },
      'generators/app/AppAnswers.ts': { destinationPath: 'generators/app/templates/generators/app/AppAnswers.ts' },
      'generators/app/AppOptions.ts': { destinationPath: 'generators/app/templates/generators/app/AppOptions.ts' },
      'generators/app/index.ts': { destinationPath: 'generators/app/templates/generators/app/index.ts' },
      'generators/utils/Utils.ts': { destinationPath: 'generators/app/templates/generators/utils/Utils.ts' },
      'README.md': { destinationPath: 'generators/app/templates/README.md' },
    };

    Utils.copyTemplates(this, templates);
  }
}
