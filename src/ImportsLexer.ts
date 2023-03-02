export type ImportLexed = {
  importTarget: string;
  importedAs: string;
  exportedAs: string;
};

export const TAKE_IMPORTS_REGEX =
  /import\s*(?<imports>[a-zA-Z0-9_,* \s\{\}]+)\s*from\s*["'](?<module>.*)["'];?/g;

export const REMOVE_ALL_COMMENTS_REGEX = /\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm;

export const SEPARATE_IMPORTS_REGEX =
  /(?<name>[a-zA-Z0-9_*]+)(\s+as\s+(?<alias>[a-zA-Z0-9_]+))?/g;

export class ImportsLexer {
  constructor() {}

  static parse(code: string) {
    let fullImportMatch: RegExpExecArray | null;
    const importEntries: ImportLexed[] = [];

    const codeWithoutComments = code.replace(REMOVE_ALL_COMMENTS_REGEX, "");

    while ((fullImportMatch = TAKE_IMPORTS_REGEX.exec(codeWithoutComments))) {
      const { groups: { imports, module: moduleName } = {} } = fullImportMatch;

      const isDefaultImport =
        imports.trim()[0] !== "{" && imports.trim()[0] !== "*";

      let importMatch: RegExpExecArray | null;
      while ((importMatch = SEPARATE_IMPORTS_REGEX.exec(imports))) {
        const { name, alias } = importMatch.groups || {};
        const importEntry: ImportLexed = {
          importTarget: moduleName,
          importedAs: alias || name,
          exportedAs: isDefaultImport ? "default" : name,
        };
        importEntries.push(importEntry);
      }
    }
    return importEntries;
  }
}
