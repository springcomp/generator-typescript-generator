import * as _ from "lodash";
import { App } from "../app/App";

export class ParseResult {
  scopeName: string;
  localName: string;
}

export class TemplatesSpec {
  [key: string]: TemplateInfo;
}
export class TemplateInfo {
  destinationPath?: string;
  options?: any;
}

export class Utils {

  public static parseScopedName(name: string): ParseResult {
    const nameFragments = name.split('/');
    const parseResult: ParseResult = {
      scopeName: '',
      localName: name
    };

    if (nameFragments.length > 1) {
      parseResult.scopeName = nameFragments[0];
      parseResult.localName = nameFragments[1];
    }

    return parseResult;
  }

  public static makeGeneratorName(name: string): string {
    const parsedName = Utils.parseScopedName(name);
    name = parsedName.localName;
    name = _.kebabCase(name);
    name = name.indexOf('generator-') === 0 ? name : 'generator-' + name;
    return parsedName.scopeName ? `${parsedName.scopeName}/${name}` : name;
  }

  public static copyTemplates(app: App, templates: TemplatesSpec): void {
    Object.keys(templates).forEach(item => {
      const sourcePath = item;
      const destinationPath = templates[item].destinationPath ?? item;
      const options = templates[item].options ?? {};

      const sourceContent = app.fs.read(app.templatePath(sourcePath))

      var resolved: string | undefined = undefined;
      if (options === undefined || Object.keys(options).length == 0) {
        resolved = sourceContent;
      } else {
        const template = _.template(sourceContent);
        resolved = template(options);
      }

      app.fs.write(app.destinationPath(destinationPath), resolved);
    });
  }
}