<script setup lang="ts">
import Tooltip from '../Tooltip.vue'

const props = withDefaults(defineProps<{
    dark?: boolean,
}>(), {
    dark: false,
})

</script>
<template>
    <Tooltip v-if="$slots.tooltip"
        :dark="props.dark"
        class="flex items-center justify-center rounded-full px-[6px] h-[22px] hover:cursor-help"
        :class="[
            {'bg-black': !props.dark},
            {'bg-white': props.dark}
        ]"
    >
        <template v-if="$slots.tooltipHeader" #header>
            <slot name="tooltipHeader" />
        </template>
        <template #tooltip>
            <slot v-if="$slots.tooltip" name="tooltip" />
        </template>
        <span
            class="flex items-center justify-center text-[16px] w-[10px] font-bold"
            :class="[
                {'text-black': props.dark},
                {'text-white': !props.dark}
            ]"
        >
            ?
        </span>
    </Tooltip>
</template>