export type ImportLexed = {
  importTarget: string;
  importedAs: string;
  exportedAs: string;
};

export const TAKE_IMPORTS_REGEX =
  /import\s*((?<defaultImport>(?<hasImportStar>\*\s*as\s*)?(?<defaultImportName>[a-zA-Z0-9_]+))?\s*(,?\s*\{(?<namedImports>[\sa-zA-Z0-9_,]+)})?\s*from\s*)?["'](?<modulePath>[a-zA-Z0-9\@\-_\/\?\=]+)["']/gm;

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
      const {
        groups: {
          defaultImport,
          namedImports,
          modulePath,
          hasImportStar,
          defaultImportName,
        } = {},
      } = fullImportMatch;

      if (defaultImport) {
        const importEntry: ImportLexed = {
          importTarget: modulePath,
          importedAs: defaultImportName,
          exportedAs: hasImportStar ? "*" : "default",
        };
        importEntries.push(importEntry);
      }

      let importMatch: RegExpExecArray | null;

      if (!namedImports) {
        continue;
      }

      while ((importMatch = SEPARATE_IMPORTS_REGEX.exec(namedImports))) {
        const { name, alias } = importMatch.groups || {};

        const importEntry: ImportLexed = {
          importTarget: modulePath,
          importedAs: alias || name,
          exportedAs: name,
        };
        importEntries.push(importEntry);
      }
    }
    return importEntries;
  }
}
