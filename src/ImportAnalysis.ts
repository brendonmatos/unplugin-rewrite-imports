import { OptimizeEntry } from "./OptimizeEntry";
import { ImportEntry } from "./ImportEntry";
import { ImportLexed } from "./ImportsLexer";

export class ImportAnalysis {
  public importEntries: ImportEntry[] = [];
  constructor(public optimizeEntries: OptimizeEntry[]) {}

  getRewrites(importLexed: ImportLexed) {
    const optimizeEntry = this.optimizeEntries.find(
      (i) => i.moduleName === importLexed.importTarget
    );

    if (!optimizeEntry) {
      return;
    }

    const variableSpecificMatch = optimizeEntry.imports.find(
      (v) => v.importedAs === importLexed.importedAs
    );

    if (optimizeEntry.strict && !variableSpecificMatch) {
      return;
    }

    const rewritePath =
      variableSpecificMatch?.rewritePath || optimizeEntry.rewritePath;

    return {
      path: rewritePath?.replace("$name", importLexed.exportedAs),
      exportedAs: variableSpecificMatch?.rewriteExportedAs,
      importedAs: variableSpecificMatch?.rewriteImportedAs,
    };
  }

  addEntry(lexedImport: ImportLexed) {
    // Check if we already have an entry for this module
    // If we do, we need to merge the entries
    // If we don't, we need to add a new entry
    // If there is a rewrite configured for the module, we need to
    // separate de importEntry into another entry with the same
    // rewrite for each variable

    const rewrites = this.getRewrites(lexedImport);
    const {
      path: rewritePath,
      exportedAs: rewriteExportedAs,
      importedAs: rewriteImportedAs,
    } = rewrites || {};

    const existingEntry = this.importEntries.find((i) => {
      return (
        i.rewritePath === rewritePath &&
        i.moduleName === lexedImport.importTarget
      );
    });

    if (!existingEntry) {
      this.importEntries.push({
        rewritePath,
        rewriteExportedAs,
        rewriteImportedAs,
        moduleName: lexedImport.importTarget,
        lexedImports: [lexedImport],
      });
      return;
    }

    const existingLexedImport = existingEntry.lexedImports.find((i) => {
      return (
        i.importedAs === lexedImport.importedAs &&
        i.exportedAs === lexedImport.exportedAs &&
        i.importTarget === lexedImport.importTarget
      );
    });

    if (existingLexedImport) {
      return;
    }

    existingEntry.lexedImports.push(lexedImport);
  }
}
