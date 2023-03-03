export type OptimizeEntry = {
  moduleName: string;
  rewritePath?: string;
  /**
   * @default false
   */
  strict?: boolean;
  warnOnMissing?: boolean;
  errorOnMissing?: boolean;
  imports: {
    /**
     * @deprecated
     */
    exportedAs?: string;
    importedAs?: string;
    rewriteExportedAs?: string;
    rewriteImportedAs?: string;
    rewritePath?: string;
  }[];
};
