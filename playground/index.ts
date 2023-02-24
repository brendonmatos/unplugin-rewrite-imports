import { ImportOptimizer } from "../src/ImportOptimizer";

const testContent = `
import { a } from "common/lib";
  `;

const optimizer = new ImportOptimizer([
  {
    moduleName: "common/lib",

    imports: [
      { exportedAs: "a", importedAs: "a", rewrite: "common/lib/$name" },
    ],
  },
]);

const optimized = optimizer.optimize(testContent);

console.log(optimized);
