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

  it("should work with multiline imports", () => {
    const testContent = `
import {
  a,
  b,
  } from "common";
`;
    const result = ImportsLexer.parse(testContent);
    expect(result).length(2);
  });

  it("should work with multiline imports", () => {
    const testContent = `
import React, { useState, useEffect } from "react";
`;
    const result = ImportsLexer.parse(testContent);
    expect(result[0].exportedAs).toBe("default");
    expect(result[0].importedAs).toBe("React");
    expect(result[1].exportedAs).toBe("useState");
    expect(result[1].importedAs).toBe("useState");
    expect(result[2].exportedAs).toBe("useEffect");
    expect(result[2].importedAs).toBe("useEffect");
    expect(result).length(3);
  });

  it("should work with multiline imports", () => {
    const testContent = `
import x from "@x/y-z/a?b=c";
`;
    const result = ImportsLexer.parse(testContent);
    expect(result[0].exportedAs).toBe("default");
    expect(result[0].importedAs).toBe("x");
    expect(result[0].importTarget).toBe("@x/y-z/a?b=c");
  });
});
