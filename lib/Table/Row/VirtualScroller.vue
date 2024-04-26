<script setup lang="ts" generic="T">
import { inject, computed } from 'vue'
import RowElement from './RowElement.vue'
import {
    type ItemWithUid,
    type InternalColumn,
    type RowActionButtonConfig
} from '../TableTypes'


//@ts-ignore
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

interface Props<T> {
    items: ItemWithUid<T>[],
    columns: InternalColumn[],
    rowClasses?: string | object | any[],
    loading: boolean,
    rowHeight: number,
    pageMode: boolean,
    scroll: boolean,
    itemUid?: string,
    scrollableMaxHeight?: number,
    dark: boolean,
    rowActionButtonConfig?: RowActionButtonConfig
}
const props = defineProps<Props<T>>()

const selectable = inject('selectable') as boolean
const tableUid = inject('tableUid') as string

const filteredColumns = computed(() => props.columns.filter(column => column.caption != 'table_select' && column.key !== 'table_row_action_buttons'))

</script>
<template>
    <RecycleScroller
        :items="props.items"
        :item-size="props.rowHeight"
        item-class="flex items-center justify-center"
        class="w-full h-full scroll-y"
        :style="{
            ...(!props.pageMode && {
                maxHeight: `${props.scrollableMaxHeight ?? 500}px`
            })
        }"
        :key-field="props.itemUid ?? tableUid + '_uid'"
        :buffer="props.pageMode ? 1500 : 200"
        :page-mode="props.pageMode"
    >
        <template v-slot="{ item, index }: {item: ItemWithUid<T>, index: any}">
            <RowElement
            :item="item"
            :index="index"
            :columns="props.columns"
            :selectable="selectable"
            :item-count="props.items.length"
            :row-height="props.rowHeight"
            :dark="props.dark"
            :scroll="props.scroll"
            :key="item[props.itemUid ?? tableUid + '_uid']"
            :row-action-button-config="props.rowActionButtonConfig"
        >
            <template v-for="column in filteredColumns" #[column.cellSlotName]="{item}">
                <slot
                    :name="column.cellSlotName"
                    :item="item"
                    :index="index as number"
                />
            </template>
        </RowElement>
        </template>
    </RecycleScroller>
    
</template>
<style scoped>
.virtual-scroller :deep(td), .virtual-scroller :deep(.header-prefix) {
    @apply py-1 pl-2 pr-3 text-sm 
}

.virtual-scroller :deep(.item-smooth) {
    -webkit-font-smoothing: subpixel-antialiased;
    -webkit-transform: translateZ(0) scale(1.0, 1.0);
    -webkit-backface-visibility: hidden;
    filter: blur(0);
    -webkit-filter: blur(0);
    image-rendering: optimizeSpeed;             /*                     */
    image-rendering: -moz-crisp-edges;          /* Firefox             */
    image-rendering: -o-crisp-edges;            /* Opera               */
    image-rendering: -webkit-optimize-contrast; /* Chrome (and Safari) */
    image-rendering: optimize-contrast;         /* CSS3 Proposed       */
    -ms-interpolation-mode: nearest-neighbor;   /* IE8+                */
}

table {
    @apply
    w-full table-auto text-left
    
    /* Responsive*/
    block md:table
    
    /* Print */
    print:table print:visible print:w-screen print:!text-black print:[&_*]:!text-black
}

tbody {
    @apply

    flex flex-col gap-5 items-center
    justify-center overflow-hidden

    md:table-row-group md:float-none md:overflow-x-hidden
    print:table-row-group print:float-none print:overflow-x-hidden
}

</style>