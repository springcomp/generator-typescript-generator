import { Options } from "../Options";
export class AppOptions extends Options {
	localName: string;
	name: string;
	scopeName: string;

	['skip-install']: boolean = false;

	travis: boolean = true;
	coveralls: boolean = false;
	editorconfig: boolean = true;
	license: boolean = true;
	githubAccount: string;
	repositoryName: string;
}