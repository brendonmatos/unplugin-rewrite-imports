import { ImportAnalysis } from "./ImportAnalysis";

export class ImportsWritter {
  static createImportLine(importSettings: {
    defaultImportName?: string;
    starImport?: boolean;
    destructuredImports?: { variableName: string; aliasName?: string }[];
    importTarget: string;
    withSemicolon?: boolean;
  }) {
    const { withSemicolon = true } = importSettings;

    const importedContents = [];

    if (importSettings.defaultImportName) {
      if (importSettings.starImport) {
        importedContents.push(`* as ${importSettings.defaultImportName}`);
      } else {
        importedContents.push(importSettings.defaultImportName);
      }
    }

    if (importSettings.destructuredImports) {
      if (importSettings.defaultImportName) {
        importedContents.push(",");
      }

      importedContents.push("{");
      const namedImports = [];
      for (const destructuredImport of importSettings.destructuredImports) {
        if (
          destructuredImport.aliasName &&
          destructuredImport.aliasName !== destructuredImport.variableName
        ) {
          namedImports.push(
            `${destructuredImport.variableName} as ${destructuredImport.aliasName}`
          );
        } else {
          namedImports.push(destructuredImport.variableName);
        }
      }
      importedContents.push(namedImports.join(", "), "}");
    }

    const postfix = withSemicolon ? ";" : "";

    if (importedContents.length === 0) {
      return `import "${importSettings.importTarget}"${postfix}`;
    }

    return `import ${importedContents.join(" ")} from "${
      importSettings.importTarget
    }"${postfix}`;
  }

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
            ImportsWritter.createImportLine({
              importTarget: importEntry.moduleName,
              destructuredImports: destructurerImportsLexed.map((im) => ({
                variableName: im.exportedAs!,
                aliasName: im.importedAs,
              })),
            })
          );
        }

        for (const defaultImportLexed of defaultImportsLexed) {
          importStrings.push(
            ImportsWritter.createImportLine({
              importTarget: importEntry.moduleName,
              defaultImportName: defaultImportLexed.importedAs,
              starImport: defaultImportLexed.exportedAs === "*",
            })
          );
        }

        for (const otherImportLexed of otherImportsLexed) {
          importStrings.push(
            ImportsWritter.createImportLine({
              importTarget: importEntry.moduleName,
            })
          );
        }

        continue;
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
          importStrings.push(
            ImportsWritter.createImportLine({
              importTarget: importEntry.rewritePath,
              defaultImportName: importedVariable,
              starImport: exportedVariable === "*",
            })
          );
          continue;
        }
        if (shouldAssumeToDefaultExportRewrite) {
          importStrings.push(
            ImportsWritter.createImportLine({
              importTarget: importEntry.rewritePath,
              defaultImportName: importedVariable,
            })
          );
          continue;
        }

        if (!importedVariable && !exportedVariable) {
          importStrings.push(
            ImportsWritter.createImportLine({
              importTarget: importEntry.rewritePath,
            })
          );
          continue;
        }
      }
    }

    return importStrings.join("\n");
  }
}
