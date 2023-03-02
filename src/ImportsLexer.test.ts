import { describe, it, expect } from "vitest";
import { ImportsLexer } from "./ImportsLexer";

describe("imports lexer", () => {
  it("should work with", () => {
    const testContent = `
import { a, b, c as d, e } from "common";
`;

    const result = ImportsLexer.parse(testContent);

    expect(result).length(4);
    expect(result[0].importTarget).toBe("common");
    expect(result[0].exportedAs).toBe("a");
    expect(result[0].importedAs).toBe("a");

    expect(result[2].exportedAs).toBe("c");
    expect(result[2].importedAs).toBe("d");
  });

  it("should work with default imports", () => {
    const testContent = `
import a from "common";
`;

    const result = ImportsLexer.parse(testContent);
    expect(result).length(1);
    expect(result[0].importTarget).toBe("common");
    expect(result[0].exportedAs).toBe("default");
    expect(result[0].importedAs).toBe("a");
  });

  it("should work with default imports", () => {
    const testContent = `
import * as a from "common/a";
`;

    const result = ImportsLexer.parse(testContent);
    expect(result).length(1);
    expect(result[0].importTarget).toBe("common/a");
    expect(result[0].exportedAs).toBe("*");
    expect(result[0].importedAs).toBe("a");
  });

  it("should work with default imports", () => {
    const testContent = `
// import { a, b, c as d, e } from "common";
import x from "common";
/**
 * import { a, b, c as d, e } from "common";
 * import x from "common";
 * import * as a from "common/a";
 */
import {y} from "common";
`;

    const result = ImportsLexer.parse(testContent);
    expect(result).length(2);
  });
});
