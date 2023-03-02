import { ImportLexed } from "./ImportsLexer";

export type ImportEntry = {
  moduleName: string;
  lexedImports: ImportLexed[];
  rewritePath?: string;
  rewriteExportedAs?: string;
  rewriteImportedAs?: string;
};
