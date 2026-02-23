<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { useVModel } from "@vueuse/core";
import { cn } from "@/lib/utils";
import { inputVariants, type InputVariants } from ".";

const props = defineProps<{
    size?: InputVariants["size"];
    variant?: InputVariants["variant"];
    defaultValue?: string | number;
    modelValue?: string | number;
    class?: HTMLAttributes["class"];
}>();

const emits = defineEmits<{
    (e: "update:modelValue", payload: string | number): void;
}>();

const modelValue = useVModel(props, "modelValue", emits, {
    passive: true,
    defaultValue: props.defaultValue,
});
</script>

<template>
    <input v-model="modelValue" data-slot="input" :class="cn(inputVariants({ size, variant }), props.class)" />
</template>
