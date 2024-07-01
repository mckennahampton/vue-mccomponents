<script setup lang="ts">
import { type InternalColumn } from '../TableTypes'

const props = defineProps<{
    column: InternalColumn
    item: any,
    itemCount: number,
    dark: boolean,
    index: number,
    isSelected: boolean,
    scroll: boolean,
}>()
</script>
<template>
    <component :is="props.scroll ? 'div' : 'td'"
        :header="props.column.caption"
        class="py-2 pl-2 max-md:!w-full max-md:!max-w-none max-md:!min-w-non max-md:min-h-[50px] max-md:border-t max-md:first:border-t-0 max-md:last:border-t-0"
        :class="[
            props.column?.cellOptions?.classes,
            props.column?.cellOptions?.useMinimumSpace ? 'md:!w-[1px]' : 'md:!w-auto md:max-w-[50px]',
            {'overflow-hidden text-ellipsis whitespace-nowrap': props.column.cellOptions?.ellipse },
            {'md:!table-cell': !props.scroll},
            {'md:!block md:!max-w-none': props.scroll},
            {'before:text-neutral-800 border-t-neutral-300': !props.dark && props.index % 2 == 0 && !props.isSelected /* Light, odd, unselected */},
            {'before:text-neutral-800 border-t-cyan-500': !props.dark && props.index % 2 == 0 && props.isSelected /* Light, odd, selected */},
            {'before:text-neutral-800 border-t-neutral-400': !props.dark && props.index % 2 != 0 && !props.isSelected /*Light, even, unselected */},
            {'before:text-neutral-800 border-t-cyan-600': !props.dark && props.index % 2 != 0 && props.isSelected /*Light, even, selected */},
            {'before:text-neutral-500 border-t-neutral-800': props.dark && props.index % 2 == 0 && !props.isSelected /*Dark, odd, unselected  */},
            {'before:text-cyan-500 border-t-cyan-800': props.dark && props.index % 2 == 0 && props.isSelected /*Dark, odd, selected  */},
            {'before:text-neutral-500 border-t-neutral-700': props.dark && props.index % 2 != 0 && !props.isSelected /*Dark, even, unselected */ },
            {'before:text-cyan-400 border-t-cyan-600': props.dark && props.index % 2 != 0 && props.isSelected /*Dark, even, selected */ }
        ]"
        :style="{
            ...(props.scroll && {
                width: props.column.width+'px',
                maxWidth: props.column.width+'px',
                minWidth: props.column.width+'px',
            }),
            ...((props.itemCount <= 50 || props.scroll) && props.column?.cellOptions?.suggestedWidth && {
                maxWidth: props.column.cellOptions.suggestedWidth + 'px'
            })
        }"
        :data-cell="props.column.cellSlotName"
    >
        <slot
            :name="props.column.cellSlotName"
            :item="props.item"
        />
    </component>
</template>
<style scoped>

[data-cell] {
    @apply

    /* Mobile Styling */
    flex flex-col items-stretch text-sm
    justify-stretch max-md:w-full md:w-auto col-span-full relative

    /* Desktop */
    md:border-b-0 md:pr-3
    print:border-b-0 print:table-cell print:w-auto print:max-w-[450px]
}

/* Mobile header styling */
[data-cell] {
    @apply
    before:content-[attr(header)] before:relative before:whitespace-nowrap
    before:w-full before:leading-tight
    before:font-bold before:text-[13px]

    /* Desktop */
    md:before:hidden
    print:before:hidden
}

</style>