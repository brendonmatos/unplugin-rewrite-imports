import { expect, it } from "vitest";
import { optimizeImports } from ".";
import { Plugin } from "vite";

it("should ingore when the is ignore defined", () => {
  const plugin = optimizeImports.vite({
    ignorePaths: [/node_modules/, "nonono"],
    optimize: [],
  });

  const p = plugin as Plugin;

  // @ts-ignore
  expect(p.transform("import { a } from 'a'", "a.ts").code.trim()).toBe(
    'import { a } from "a";'
  );

  expect(
    // @ts-ignore
    p.transform("import { a } from 'a'", "node_modules/a.ts")
  ).toBeUndefined();

  expect(
    // @ts-ignore
    p.transform("import { a } from 'a'", "nonono")
  ).toBeUndefined();
});
