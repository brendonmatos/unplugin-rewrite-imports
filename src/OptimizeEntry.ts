export type OptimizeEntry = {
  moduleName: string;
  rewritePath?: string;
  /**
   * @default false
   */
  strict?: boolean;

  /**
   * @deprecated
   */
  warnOnMissing?: boolean;

  /**
   * @deprecated
   */
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
