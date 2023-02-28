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

      if (!importEntry.rewrite) {
        // get all that does not import default

        const imports = importEntry.lexedImports.filter(
          (i) => i.importedAs !== "default"
        );

        // TODO: test if there is only one default import

        importStrings.push(
          `import { ${imports
            .map((im) => {
              if (im.importedAs === im.exportedAs) {
                return im.importedAs;
              }

              return `${im.exportedAs} as ${im.importedAs}`;
            })
            .join(", ")} } from "${importEntry.moduleName}";`
        );

        continue;
      }

      // If there is a rewrite, we need to create imports separately
      // for each variable. Otherwise we can join all variables into
      // one import statement, if there is no rewrite found for module
      // or variable.

      for (const lexedImport of importEntry.lexedImports) {
        const importModule = importEntry.rewrite.replace(
          "$name",
          lexedImport.exportedAs
        );

        importStrings.push(
          `import ${lexedImport.importedAs} from "${importModule}";`
        );
      }
    }

    return importStrings.join("\n");
  }

  optimize(code: string) {
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
      map: magicString.generateMap(),
    };
  }
}
