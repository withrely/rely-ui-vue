export interface ComponentMeta {
  /**
   * Nombre del componente (ej: "button")
   */
  name: string;

  /**
   * Archivos relativos a /templates que deben copiarse
   */
  files: string[];

  /**
   * Dependencias necesarias para instalar el componente
   */
  dependencies?: {
    /**
     * Infraestructura interna (core)
     * ej: ['primitive']
     */
    core?: string[];

    /**
     * Otros componentes de UI
     * ej: ['button']
     */
    components?: string[];
  };
}
