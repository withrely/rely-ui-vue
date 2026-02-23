<script setup lang="ts">
import type { DropdownMenuSubTriggerProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { ChevronRight } from "lucide-vue-next";
import { DropdownMenuSubTrigger, useForwardProps } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps<
  DropdownMenuSubTriggerProps & {
    class?: HTMLAttributes["class"];
    inset?: boolean;
  }
>();

const delegatedProps = reactiveOmit(props, "class", "inset");
const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <DropdownMenuSubTrigger
    data-slot="dropdown-menu-sub-trigger"
    :data-inset="inset ? '' : undefined"
    v-bind="forwardedProps"
    :class="
      cn(
        'group focus:bg-hover-popover focus:text-popover-foreground data-[state=open]:bg-hover-popover flex cursor-default items-center rounded-md px-2 py-1 text-sm outline-none select-none data-inset:pl-8',
        props.class,
      )
    "
  >
    <slot />
    <ChevronRight
      class="transition-transform rotate-45 opacity-50 group-data-[state=open]:rotate-0 size-4 ml-auto"
    />
  </DropdownMenuSubTrigger>
</template>
