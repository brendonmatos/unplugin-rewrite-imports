import { ImportLexed } from "./ImportsLexer";

export type ImportEntry = {
  moduleName: string;
  lexedImports: ImportLexed[];
  rewrite?: string;
};
