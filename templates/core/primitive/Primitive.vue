<script setup lang="ts">
import { computed, useAttrs } from 'vue'

type As = keyof HTMLElementTagNameMap | string

const props = withDefaults(
    defineProps<{
        as?: As
        asChild?: boolean
    }>(),
    {
        as: 'div',
        asChild: false,
    }
)

const attrs = useAttrs()

const tag = computed(() => (props.asChild ? undefined : props.as))
</script>

<template>
    <slot v-if="asChild" v-bind="attrs" />

    <component v-else :is="tag" v-bind="attrs">
        <slot />
    </component>
</template>
