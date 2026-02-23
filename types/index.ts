export type RegistryItemType =
  | 'components:ui'
  | 'components:lib'
  | 'components:core'
  | 'components:block';

export interface ComponentMeta {
  name?: string;
  type?: RegistryItemType;
  files?: string[];
  dependencies?: {
    external?: string[];
    registry?: string[];
    core?: string[];
  };
}

export interface RegistryIndexItem {
  name: string;
  type: RegistryItemType;
  dependencies: string[];
  registryDependencies: string[];
  files: Array<{
    name: string;
    content: string;
  }>;
}
