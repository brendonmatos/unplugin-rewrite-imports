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

  it("should work with default imports", () => {
    //     const testContent = `
    //   import { x, y } from "common";
    // `;

    const analysis = new ImportAnalysis([
      {
        moduleName: "common",
        imports: [
          {
            importedAs: "x",
            rewritePath: "common/yay",
            rewriteImportedAs: "{ x }",
          },
          {
            importedAs: "y",
            rewritePath: "common/yay",
            rewriteImportedAs: "{ y }",
          },
        ],
      },
    ]);

    analysis.addEntry({
      importTarget: "common",
      importedAs: "x",
      exportedAs: "x",
    });

    analysis.addEntry({
      importTarget: "common",
      importedAs: "y",
      exportedAs: "y",
    });

    expect(analysis.importEntries).toHaveLength(2);
    expect(analysis.importEntries[0].lexedImports).toHaveLength(1);
    expect(analysis.importEntries[1].lexedImports).toHaveLength(1);
  });

  it("should work with default imports", () => {
    //     const testContent = `
    //   import { x, y } from "common";
    // `;

    const analysis = new ImportAnalysis([
      {
        moduleName: "lodash",
        rewritePath: "lodash-es/$name",
        imports: [
          {
            importedAs: "map",
          },
          {
            importedAs: "debounce",
          },
        ],
      },
      {
        moduleName: "lodash-es",
        rewritePath: "lodash-es/$name",
        imports: [
          {
            importedAs: "map",
          },
          {
            importedAs: "debounce",
          },
        ],
      },
    ]);

    analysis.addEntry({
      importTarget: "lodash",
      importedAs: "map",
      exportedAs: "map",
    });

    analysis.addEntry({
      importTarget: "lodash",
      importedAs: "debounce",
      exportedAs: "debounce",
    });

    analysis.addEntry({
      importTarget: "lodash-es",
      importedAs: "map",
      exportedAs: "map",
    });

    analysis.addEntry({
      importTarget: "lodash-es",
      importedAs: "debounce",
      exportedAs: "debounce",
    });
  });

  it("should throw error when is configured to it", () => {
    const analysis = new ImportAnalysis([
      {
        moduleName: "lodash",
        errorOnMissing: true,
        imports: [
          {
            importedAs: "map",
          },
          {
            importedAs: "debounce",
          },
        ],
      },
    ]);

    analysis.addEntry({
      importTarget: "lodash",
      importedAs: "map",
      exportedAs: "map",
    });
    expect(() =>
      analysis.addEntry({
        importTarget: "lodash",
        importedAs: "deepClone",
        exportedAs: "deepClone",
      })
    ).toThrowError();
  });

  it("should throw error when is configured to it", () => {
    const analysis = new ImportAnalysis([
      {
        moduleName: "lodash",
        errorOnMissing: true,
        imports: [
          {
            importedAs: "map",
          },
          {
            importedAs: "debounce",
          },
        ],
      },
    ]);

    analysis.addEntry({
      importTarget: "lodash",
      importedAs: "map",
      exportedAs: "map",
    });
    expect(() =>
      analysis.addEntry({
        importTarget: "lodash",
        importedAs: "deepClone",
        exportedAs: "deepClone",
      })
    ).toThrowError();
  });

  it("should throw error when is configured to it 2", () => {
    const analysis = new ImportAnalysis([
      {
        moduleName: "lodash",
        rewritePath: "lodash-es/$name",
        errorOnMissing: true,
        imports: [
          {
            importedAs: "map",
          },
          {
            importedAs: "debounce",
          },
        ],
      },
      {
        moduleName: "lodash",
        rewritePath: "lodash-es-2/$name",
        errorOnMissing: true,
        imports: [
          {
            importedAs: "cloneDeep",
          },
          {
            importedAs: "keyBy",
          },
        ],
      },
    ]);

    expect(() =>
      analysis.addEntry({
        importTarget: "lodash",
        importedAs: "map",
        exportedAs: "map",
      })
    ).not.toThrowError();

    expect(() =>
      analysis.addEntry({
        importTarget: "lodash",
        importedAs: "concat",
        exportedAs: "concat",
      })
    ).toThrowError();
  });
});
