<script setup lang="ts">
import Tooltip from '../../Misc/Tooltip.vue'

const props = withDefaults(defineProps<{
    dark?: boolean,
}>(), {
    dark: false,
})

</script>
<template>
    <Tooltip v-if="$slots.tooltip"
        class="flex items-center justify-center rounded-full px-[6px] !h-[20px] !w-[20px] hover:cursor-help border border-neutral-500"
        :tooltip-classes="$slots.tooltipHeader ? 'max-w-[300px]' : undefined"
        :dark="props.dark"
    >
        
        <template v-if="$slots.tooltipHeader" #header>
            <slot name="tooltipHeader" />
        </template>
        <template #tooltip>
            <slot v-if="$slots.tooltip" name="tooltip" />
        </template>

        <span class="flex items-center justify-center text-[14px] w-[10px] font-bold">
            ?
        </span>

    </Tooltip>
</template>