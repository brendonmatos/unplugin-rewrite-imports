export type OptimizeEntry = {
  moduleName: string;
  rewritePath?: string;
  /**
   * @default false
   */
  strict?: boolean;
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
