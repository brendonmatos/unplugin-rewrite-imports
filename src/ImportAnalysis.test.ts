import { describe, it, expect } from "vitest";
import { ImportAnalysis } from "./ImportAnalysis";

describe("ImportAnalysis", () => {
  it("should work", () => {
    const importAnalysis = new ImportAnalysis([
      {
        moduleName: "lodash",
        strict: true,
        imports: [
          {
            importedAs: "map",
            rewritePath: "lodash-es/map",
          },
        ],
      },
    ]);

    importAnalysis.addEntry({
      importTarget: "lodash",
      importedAs: "map",
      exportedAs: "map",
    });

    importAnalysis.addEntry({
      importTarget: "lodash",
      importedAs: "debounce",
      exportedAs: "debounce",
    });

    expect(importAnalysis.importEntries).toHaveLength(2);
  });

  it("should work with rewrite", () => {
    // const testContent = `
    // import { a, b, c as d, e } from "common";
    // import f from 'common/lib/f';
    // import { a } from "common";
    // import { e } from "common";
    // import { g } from "do-nothing";
    // `;

    const optimizer = new ImportAnalysis([
      {
        moduleName: "common",
        imports: [{ importedAs: "d", rewritePath: "common/lib/$name" }],
        rewritePath: "common/another/$name",
      },
    ]);

    optimizer.addEntry({
      importTarget: "common",
      importedAs: "a",
      exportedAs: "a",
    });

    optimizer.addEntry({
      importTarget: "common",
      importedAs: "b",
      exportedAs: "b",
    });

    optimizer.addEntry({
      importTarget: "common",
      importedAs: "c",
      exportedAs: "d",
    });

    optimizer.addEntry({
      importTarget: "common",
      importedAs: "e",
      exportedAs: "e",
    });

    optimizer.addEntry({
      importTarget: "common/lib/f",
      importedAs: "f",
      exportedAs: "f",
    });

    optimizer.addEntry({
      importTarget: "common",
      importedAs: "a",
      exportedAs: "a",
    });

    optimizer.addEntry({
      importTarget: "common",
      importedAs: "e",
      exportedAs: "e",
    });

    optimizer.addEntry({
      importTarget: "do-nothing",
      importedAs: "g",
      exportedAs: "g",
    });

    const importAsA = optimizer.importEntries.find(
      (i) => i.moduleName === "common" && i.rewritePath === "common/another/a"
    );

    expect(importAsA).toBeDefined();
    expect(importAsA?.lexedImports).toHaveLength(1);

    const importAsE = optimizer.importEntries.find(
      (i) => i.moduleName === "common" && i.rewritePath === "common/another/e"
    );

    expect(importAsE).toBeDefined();
    expect(importAsE?.lexedImports).toHaveLength(1);
  });
});
