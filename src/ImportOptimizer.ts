import MagicString from "magic-string";
import { OptimizeEntry } from "./OptimizeEntry";
import { ImportAnalysis } from "./ImportAnalysis";
import { TAKE_IMPORTS_REGEX, ImportsLexer } from "./ImportsLexer";
import { ImportsWritter } from "./ImportsWritter";

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
    const importsString = ImportsWritter.writeFromAnalysis(importAnalysis);

    magicString.prependLeft(0, importsString + "\n");

    return {
      code: magicString.toString(),
      map: magicString.generateMap({
        source: id,
      }),
    };
  }
}
