import type { ComponentMeta } from '../../../types';

export default {
  type: 'components:lib',
  dependencies: {
    external: ['clsx', 'tailwind-merge', 'reka-ui'],
    registry: [],
  },
} satisfies ComponentMeta;
