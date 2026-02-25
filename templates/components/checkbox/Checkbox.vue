<script setup lang="ts">
import type { CheckboxRootEmits, CheckboxRootProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { Check } from "lucide-vue-next";
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps<
  CheckboxRootProps & { class?: HTMLAttributes["class"] }
>();
const emits = defineEmits<CheckboxRootEmits>();

const delegatedProps = reactiveOmit(props, "class");

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <CheckboxRoot
    v-slot="slotProps"
    data-slot="checkbox"
    v-bind="forwarded"
    :class="
      cn(
        'peer border-input bg-secondary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-offset-background size-4 shrink-0 rounded-sm border shadow outline-none focus-visible:ring-3 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
  >
    <CheckboxIndicator
      data-slot="checkbox-indicator"
      class="grid text-current transition-none place-content-center"
    >
      <slot v-bind="slotProps">
        <Check class="size-3" />
      </slot>
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
