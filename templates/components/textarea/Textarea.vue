<script setup lang="ts">
import type { HTMLAttributes, TextareaHTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { textareaVariants, type TextareaVariants } from './textarea'

interface Props extends /* @vue-ignore */ TextareaHTMLAttributes {
    size?: TextareaVariants['size']
    variant?: TextareaVariants['variant']
    class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const modelValue = defineModel<string | number>()
</script>

<template>
    <textarea v-model="modelValue" :class="cn(textareaVariants({ size, variant }), props.class)" />
</template>