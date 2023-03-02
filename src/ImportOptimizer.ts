import MagicString from "magic-string";
import { OptimizeEntry } from "./OptimizeEntry";
import { ImportAnalysis } from "./ImportAnalysis";
import { TAKE_IMPORTS_REGEX, ImportsLexer } from "./ImportsLexer";

export class ImportOptimizer {
  constructor(public optimizeEntries: OptimizeEntry[]) {}

  createImportsAnalysis(code: string): ImportAnalysis {
    const analysis = new ImportAnalysis(this.optimizeEntries);
    const foundImports = ImportsLexer.parse(code);

    for (const foundImport of foundImports) {
      analysis.addEntry(foundImport);
    }

    return analysis;
  }

  createImportsString(importAnalysis: ImportAnalysis): string {
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
          (i) => i.exportedAs !== "default" && i.exportedAs !== "*"
        );

        const defaultImportsLexed = importEntry.lexedImports.filter(
          (i) => i.exportedAs === "default" || i.exportedAs === "*"
        );

        if (destructurerImportsLexed.length > 0)
          importStrings.push(
            `import { ${destructurerImportsLexed
              .map((im) => {
                if (im.importedAs === im.exportedAs) {
                  return im.importedAs;
                }

                return `${im.exportedAs} as ${im.importedAs}`;
              })
              .join(", ")} } from "${importEntry.moduleName}";`
          );

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

        continue;
      }

      // If there is a rewrite, we need to create imports separately
      // for each variable. Otherwise we can join all variables into
      // one import statement, if there is no rewrite found for module
      // or variable.
      for (const lexedImport of importEntry.lexedImports) {
        const importModule = importEntry.rewritePath.replace(
          "$name",
          lexedImport.exportedAs
        );

        const shouldAssumeToDefaultExportRewrite = Boolean(
          importEntry.rewritePath
        );
        let importedVariable = lexedImport.importedAs;
        let exportedVariable =
          importEntry.rewriteExportedAs || lexedImport.exportedAs;

        if (["default", "*"].includes(exportedVariable)) {
          if (exportedVariable === "default") {
            importedVariable = lexedImport.importedAs;
          }

          if (exportedVariable === "*") {
            importedVariable = `* as ${lexedImport.importedAs}`;
          }

          importStrings.push(
            `import ${importedVariable} from "${importModule}";`
          );
          continue;
        }
        if (shouldAssumeToDefaultExportRewrite) {
          importStrings.push(
            `import ${importedVariable} from "${importModule}";`
          );
        }
      }
    }

    return importStrings.join("\n");
  }

  optimize(code: string, id?: string) {
    const importAnalysis = this.createImportsAnalysis(code);
    const magicString = new MagicString(code);

    // Remove all imports
    let importFound;
    while ((importFound = TAKE_IMPORTS_REGEX.exec(code))) {
      const { index, 0: fullImportString } = importFound;
      magicString.remove(index, index + fullImportString.length);
    }

    // Create import strings
    const importsString = this.createImportsString(importAnalysis);

    magicString.prependLeft(0, importsString + "\n");

    return {
      code: magicString.toString(),
      map: magicString.generateMap({
        source: id,
      }),
    };
  }
}
