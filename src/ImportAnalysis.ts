import { OptimizeEntry } from "./OptimizeEntry";
import { ImportEntry } from "./ImportEntry";
import { ImportLexed } from "./ImportsLexer";

export class ImportAnalysis {
  public importEntries: ImportEntry[] = [];
  public optimizeEntriesConfig: Map<string, OptimizeEntry> = new Map();
  constructor(
    public optimizeEntries: OptimizeEntry[],
    public riskyDependencies: string[] = []
  ) {
    // pass all the inheritable config to the imports
    // so that we can merge the entries
    for (const entry of this.optimizeEntries) {
      for (const importEntry of entry.imports) {
        importEntry.rewritePath = importEntry.rewritePath || entry.rewritePath;
      }
    }

    for (const entry of this.optimizeEntries) {
      if (!entry.strict) {
        const key = this.optimizeEntryKey(entry.moduleName, "*");

        const existingEntry = this.optimizeEntriesConfig.get(key);
        if (existingEntry) {
          existingEntry.imports.push(...entry.imports);
          continue;
        }

        this.optimizeEntriesConfig.set(key, entry);
      }

      for (const importEntry of entry.imports) {
        const importedAs = importEntry.importedAs;
        if (!importedAs) {
          throw new Error(
            `Optimize entry for ${entry.moduleName} has an import without an importedAs. Please check your configuration.`
          );
        }

        const key = this.optimizeEntryKey(entry.moduleName, importedAs);
        if (this.optimizeEntriesConfig.has(key)) {
          throw new Error(
            `Optimize entry for ${key} already exists. Please check your configuration.`
          );
        }

        this.optimizeEntriesConfig.set(key, entry);
      }
    }
  }

  optimizeEntryKey(target: string, importedAs: string) {
    return `${target}::${importedAs}`;
  }

  getRewrites(importLexed: ImportLexed) {
    const optimizeEntry =
      this.optimizeEntriesConfig.get(
        this.optimizeEntryKey(importLexed.importTarget, importLexed.importedAs)
      ) ||
      this.optimizeEntriesConfig.get(
        this.optimizeEntryKey(importLexed.importTarget, "*")
      );

    if (!optimizeEntry) {
      return;
    }

    const variableSpecificMatch = optimizeEntry.imports.find(
      (v) => v.importedAs === importLexed.importedAs
    );

    if (!variableSpecificMatch) {
      const message = `Could not find a variable specific match for ${importLexed.importedAs} in ${importLexed.importTarget}`;

      if (optimizeEntry.warnOnMissing) {
        console.warn(message);
      }

      if (optimizeEntry.errorOnMissing) {
        throw new Error(message);
      }

      if (this.riskyDependencies.includes(importLexed.importTarget)) {
        throw new Error(
          `Could not find a variable specific match for ${importLexed.importedAs} in ${importLexed.importTarget}. This dependency is marked as risky.`
        );
      }
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
        i.rewriteExportedAs === rewriteExportedAs &&
        i.rewriteImportedAs === rewriteImportedAs &&
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
