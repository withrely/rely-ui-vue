import type { ComponentMeta } from '../../../types';

export default {
  type: 'components:ui',
  dependencies: {
    external: ['class-variance-authority'],
    registry: ['utils'],
  },
} satisfies ComponentMeta;
