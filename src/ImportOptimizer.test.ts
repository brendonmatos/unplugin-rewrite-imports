import { ImportOptimizer } from "./ImportOptimizer";
import { describe, it, expect } from "vitest";

describe("ImportOptimizer", () => {
  it("should work", () => {
    const testContent = `
  import { a, b, c as d, e } from "common";
  import f from 'common/lib/f';
  import { a } from "common";
  import { e } from "common";
  import { a as e, b as d } from "utils";
  import { g } from "do-nothing";
  `;

    const optimizer = new ImportOptimizer([
      {
        moduleName: "common",
        imports: [{ importedAs: "d", rewritePath: "common/lib/$name" }],
        rewritePath: "common/another/$name",
      },
    ]);

    const analysis = optimizer.createImportsAnalysis(testContent);

    expect(analysis.importEntries).toHaveLength(5);
    expect(
      analysis.importEntries.find((i) => i.rewritePath === "common/lib/$name")
        ?.lexedImports
    ).toHaveLength(1);

    const commonAnother = analysis.importEntries.find(
      (i) => i.rewritePath === "common/another/$name"
    );
    expect(commonAnother?.lexedImports).toHaveLength(3);
    expect(
      commonAnother?.lexedImports.find((i) => i.importedAs === "c")
    ).toBeUndefined();
  });

  it("should work", () => {
    const testContent = `
  import { a, b as c, e } from "common";
  import { f } from "common";
  import { a as g, b as h } from "utils";
    `;
    const optimizer = new ImportOptimizer([
      {
        moduleName: "common",
        imports: [{ importedAs: "a", rewritePath: "common/lib/$name" }],
        rewritePath: "common/another/$name",
      },
    ]);

    const optimized = optimizer.optimize(testContent);
    expect(optimized.code).toMatch(`import a from "common/lib/a"`);
    expect(optimized.code).toMatch(`import c from "common/another/b"`);
    expect(optimized.code).toMatch(`import e from "common/another/e"`);
    expect(optimized.code).toMatch(`import f from "common/another/f"`);

    expect(optimized.code).toMatch(`import { a as g, b as h } from "utils"`);

    expect(optimized.code).not.toMatch(`import { a } from "common"`);
    expect(optimized.code).not.toMatch(`import { e } from "common"`);
  });

  it("should support import rename", () => {
    const testContent = `
  import { b as c } from "common";
    `;
    const optimizer = new ImportOptimizer([
      {
        moduleName: "common",
        imports: [],
        rewritePath: "common/another/$name",
      },
    ]);

    const optimized = optimizer.optimize(testContent);
    expect(optimized.code).toMatch(`import c from "common/another/b"`);
  });

  it("should work with simple destructuring", () => {
    const testContent = `
  import { a } from "common/lib";
    `;

    const optimizer = new ImportOptimizer([
      {
        moduleName: "common/lib",
        imports: [
          {
            importedAs: "a",
            rewritePath: "common/lib/$name",
          },
        ],
      },
    ]);

    const optimized = optimizer.optimize(testContent);
    expect(optimized.code).toMatch(`import a from "common/lib/a"`);
  });

  it("should work with * structuring", () => {
    const testContent = `
  import { x } from "common";
    `;

    const optimizer = new ImportOptimizer([
      {
        moduleName: "common",
        imports: [
          {
            importedAs: "x",
            rewritePath: "common/x",
            rewriteExportedAs: "*",
          },
        ],
      },
    ]);

    const optimized = optimizer.optimize(testContent);
    expect(optimized.code).toMatch(`import * as x from "common/x"`);
  });

  it("should remove redundant rename", () => {
    const testContent = `
  import default as x from "common";
    `;

    const optimizer = new ImportOptimizer([
      {
        moduleName: "common",
        imports: [
          {
            importedAs: "x",
            rewritePath: "common/x",
          },
        ],
      },
    ]);

    const optimized = optimizer.optimize(testContent);
    expect(optimized.code).toMatch(`import x from "common/x"`);
  });

  it("should remove redundant rename", () => {
    const testContent = `
  import * as x from "common/x";
    `;

    const optimizer = new ImportOptimizer([
      {
        moduleName: "common/x",
        imports: [
          {
            importedAs: "x",
            rewritePath: "common",
          },
        ],
      },
    ]);

    const optimized = optimizer.optimize(testContent);
    expect(optimized.code).toMatch(`import * as x from "common"`);
  });

  it("should do nothing if no rewrite", () => {
    const testContent = `
  import * as x from "common";
    `;

    const optimizer = new ImportOptimizer([]);

    const optimized = optimizer.optimize(testContent);
    expect(optimized.code).toMatch(`import * as x from "common"`);
  });

  it("should rewrite imports with same name when there is no rewrite too", () => {
    const testContent = `
  import { a, b as c, e } from "common";
  import { f } from "common";
  import { a as g, b as h } from "utils";
    `;
    const optimizer = new ImportOptimizer([]);

    const optimized = optimizer.optimize(testContent);
    expect(optimized.code).toMatch(`import { a, b as c, e, f } from "common"`);
    expect(optimized.code).toMatch(`import { a as g, b as h } from "utils"`);
  });
});
