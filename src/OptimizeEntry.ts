export type OptimizeEntry = {
  moduleName: string;
  rewrite?: string;
  imports: {
    exportedAs?: string;
    importedAs?: string;
    rewrite?: string;
  }[];
};
