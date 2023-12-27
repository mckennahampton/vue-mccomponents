<script setup lang="ts">
import { type InternalColumn } from '../Table.vue'

const props = defineProps<{
    column: InternalColumn
    item: any,
    itemCount: number,
}>()

</script>
<template>
    <component :is="props.itemCount > 50 ? 'div' : 'td'"
        :header="props.column.caption"
        class="py-1 pl-2 max-md:!w-full max-md:!max-w-none max-md:!min-w-non"
        :class="[
            props.column?.cellOptions?.classes,
            props.column?.cellOptions?.useMinimumSpace && props.itemCount <= 50 ? 'md:!w-[1px]' : 'md:!w-auto md:max-w-[50px]',
            {'ellipse': props.column.cellOptions?.ellipse },
            {'md:!table-cell': props.itemCount <= 50},
            {'md:!block md:!max-w-none': props.itemCount > 50}
        ]"
        :style="{
            ...(props.itemCount > 50 && {
                width: props.column.width+'px',
                maxWidth: props.column.width+'px',
                minWidth: props.column.width+'px',
            }),
            ...(props.itemCount <= 50 && props.column?.cellOptions?.suggestedWidth && {
                maxWidth: props.column.cellOptions.suggestedWidth + 'px'
            })
        }"
        :data-cell="props.column.slotName"
    >
        <slot
            :name="props.column.slotName"
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
    before:w-full before:leading-tight before:text-black
    before:font-bold before:text-[13px]

    /* Desktop */
    md:before:hidden
    print:before:hidden
}

</style>