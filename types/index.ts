export interface ComponentMeta {
  name: string;
  files: string[];
  dependencies?: {
    core?: string[];
    components?: string[];
  };
}
