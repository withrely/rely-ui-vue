<script setup lang="ts">
import { computed } from 'vue'
import Primitive from '../primitive/Primitive.vue'

type Variant = 'default' | 'secondary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(
    defineProps<{
        variant?: Variant
        size?: Size
        as?: string
        asChild?: boolean
    }>(),
    {
        variant: 'default',
        size: 'md',
        as: 'button',
        asChild: false,
    }
)

const base =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

const variants: Record<Variant, string> = {
    default: 'bg-black text-white hover:bg-black/90',
    secondary: 'bg-gray-100 text-black hover:bg-gray-200',
    outline: 'border border-gray-300 hover:bg-gray-100',
    ghost: 'hover:bg-gray-100',
}

const sizes: Record<Size, string> = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-12 px-6 text-lg',
}

const classes = computed(
    () => `${base} ${variants[props.variant]} ${sizes[props.size]}`
)
</script>

<template>
    <Primitive :as="as" :as-child="asChild" :class="classes">
        <slot />
    </Primitive>
</template>
