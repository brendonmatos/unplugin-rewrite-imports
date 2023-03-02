import { createUnplugin } from "unplugin";
import { ImportOptimizer } from "./ImportOptimizer";
import { OptimizeEntry } from "./OptimizeEntry";

export const optimizeImports = createUnplugin(
  (options: { optimize: OptimizeEntry[] }) => {
    const { optimize } = options;
    const optimizer = new ImportOptimizer(optimize);

    return {
      name: "optimize-imports",
      enforce: "pre",
      transform(code, id) {
        if (!/.(js|jsx|ts|tsx)$/.test(id)) {
          return;
        }

        return optimizer.optimize(code, id);
      },
    };
  }
);
