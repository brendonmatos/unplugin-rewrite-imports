import { expect, it } from "vitest";
import { ImportAnalysis } from "./ImportAnalysis";
import { ImportsWritter } from "./ImportsWritter";

it("should work", () => {
  const analysis = new ImportAnalysis([
    {
      moduleName: "lodash",
      rewritePath: "lodash-es/i-was-commonjs/$name",
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
      rewritePath: "lodash-es/i-was-esm/$name",
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
    importTarget: "lodash-es",
    importedAs: "debounce",
    exportedAs: "debounce",
  });

  const importsString = ImportsWritter.writeFromAnalysis(analysis);

  expect(importsString).toMatch(
    `import debounce from "lodash-es/i-was-esm/debounce";`
  );
  expect(importsString).toMatch(
    `import map from "lodash-es/i-was-commonjs/map";`
  );
});

it("should work", () => {
  const analysis = new ImportAnalysis([
    {
      moduleName: "common",
      rewritePath: "common/src/api/$name",
      strict: true,
      imports: [
        {
          importedAs: "apiA",
        },

        {
          importedAs: "apiB",
        },
      ],
    },
    {
      moduleName: "common",
      rewritePath: "common/src/atoms/$name",
      strict: true,
      imports: [
        {
          importedAs: "ComponentA",
        },
        {
          importedAs: "ComponentB",
        },
      ],
    },

    {
      moduleName: "common",
      rewritePath: "common/src/molecules/$name",
      strict: true,
      imports: [
        {
          importedAs: "ComponentC",
        },
        {
          importedAs: "ComponentD",
        },
      ],
    },
  ]);

  analysis.addEntry({
    importTarget: "common",
    importedAs: "ComponentD",
    exportedAs: "ComponentD",
  });

  const importsString = ImportsWritter.writeFromAnalysis(analysis);

  expect(importsString).toMatch(
    `import ComponentD from "common/src/molecules/ComponentD";`
  );
});

it("should not ignore empty name imports", () => {
  const analysis = new ImportAnalysis([]);

  analysis.addEntry({
    importTarget: "common",
  });

  const importsString = ImportsWritter.writeFromAnalysis(analysis);

  expect(importsString).toMatch(`import "common";`);
});
