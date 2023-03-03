import { createUnplugin } from "unplugin";
import { ImportOptimizer } from "./ImportOptimizer";
import { OptimizeEntry } from "./OptimizeEntry";

export const optimizeImports = createUnplugin(
  (options: {
    optimize: OptimizeEntry[];
    ignorePaths?: (RegExp | string)[];
  }) => {
    const { optimize, ignorePaths = [/node_modules/] } = options;
    const optimizer = new ImportOptimizer(optimize);

    return {
      name: "optimize-imports",
      enforce: "pre",
      transform(code, id) {
        if (!/.(js|jsx|ts|tsx)$/.test(id)) {
          return;
        }

        if (
          ignorePaths?.some((ignorePath) => {
            if (ignorePath instanceof RegExp) {
              return ignorePath.test(id);
            }

            return id.includes(ignorePath);
          })
        ) {
          return;
        }

        return optimizer.optimize(code, id);
      },
    };
  }
);
