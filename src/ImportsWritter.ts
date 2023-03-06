import { ImportAnalysis } from "./ImportAnalysis";

export class ImportsWritter {
  static writeFromAnalysis(importAnalysis: ImportAnalysis): string {
    const importStrings: string[] = [];

    // Iterate over the analysis and create import strings
    for (const importEntry of importAnalysis.importEntries) {
      // If there is a rewrite, we need to create imports separately
      // for each variable. Otherwise we can join all variables into
      // one import statement, if there is no rewrite found for module
      // or variable.

      if (!importEntry.rewritePath) {
        // get all that does not import default
        const destructurerImportsLexed = importEntry.lexedImports.filter(
          (i) =>
            i.exportedAs && i.exportedAs !== "default" && i.exportedAs !== "*"
        );

        const defaultImportsLexed = importEntry.lexedImports.filter(
          (i) => i.exportedAs === "default" || i.exportedAs === "*"
        );

        const otherImportsLexed = importEntry.lexedImports.filter(
          (i) =>
            !destructurerImportsLexed.includes(i) &&
            !defaultImportsLexed.includes(i)
        );

        if (destructurerImportsLexed.length > 0) {
          importStrings.push(
            // TODO: Move this to a separate function
            // and add tests for it
            `import { ${destructurerImportsLexed
              .map((im) => {
                if (im.importedAs === im.exportedAs) {
                  return im.importedAs;
                }

                return `${im.exportedAs} as ${im.importedAs}`;
              })
              .join(", ")} } from "${importEntry.moduleName}";`
          );
        }

        for (const defaultImportLexed of defaultImportsLexed) {
          let importedVariable = defaultImportLexed.importedAs;

          if (defaultImportLexed.exportedAs === "*") {
            importedVariable = `* as ${defaultImportLexed.importedAs}`;
          }

          if (defaultImportLexed.exportedAs === "default") {
            importedVariable = defaultImportLexed.importedAs;
          }

          importStrings.push(
            `import ${importedVariable} from "${importEntry.moduleName}";`
          );
        }

        for (const otherImportLexed of otherImportsLexed) {
          importStrings.push(`import "${importEntry.moduleName}";`);
        }
      }

      // If there is a rewrite, we need to create imports separately
      // for each variable. Otherwise we can join all variables into
      // one import statement, if there is no rewrite found for module
      // or variable.
      for (const lexedImport of importEntry.lexedImports) {
        const shouldAssumeToDefaultExportRewrite = Boolean(
          importEntry.rewritePath
        );
        let importedVariable =
          importEntry.rewriteImportedAs || lexedImport.importedAs;
        let exportedVariable =
          importEntry.rewriteExportedAs || lexedImport.exportedAs;

        if (exportedVariable && ["default", "*"].includes(exportedVariable)) {
          if (exportedVariable === "default") {
            importedVariable = lexedImport.importedAs;
          }

          if (exportedVariable === "*") {
            importedVariable = `* as ${lexedImport.importedAs}`;
          }

          importStrings.push(
            `import ${importedVariable} from "${importEntry.rewritePath}";`
          );
          continue;
        }
        if (shouldAssumeToDefaultExportRewrite) {
          importStrings.push(
            `import ${importedVariable} from "${importEntry.rewritePath}";`
          );
          continue;
        }

        if (!importedVariable && !exportedVariable) {
          importStrings.push(`import "${importEntry.rewritePath}";`);
          continue;
        }
      }
    }

    return importStrings.join("\n");
  }
}
