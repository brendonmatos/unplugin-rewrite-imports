export type OptimizeEntry = {
  moduleName: string;
  rewritePath?: string;
  imports: {
    /**
     * @deprecated
     */
    exportedAs?: string;
    importedAs?: string;
    rewriteExportedAs?: string;
    rewritePath?: string;
  }[];
};
