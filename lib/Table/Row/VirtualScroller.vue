<script setup lang="ts">
import { inject, computed } from 'vue'
import RowElement from './RowElement.vue'
import { type InternalColumn} from '../Table.vue'

//@ts-ignore
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

interface Props {
    items: any[],
    columns: InternalColumn[],
    rowClasses?: string | object | any[],
    scroll: boolean,
    loading: boolean,
    rowHeight: number,
    dark: boolean,
    pageMode: boolean,
}
const props = defineProps<Props>()

const selectable = inject('selectable') as boolean
const tableUid = inject('tableUid') as string

const filteredColumns = computed(() => props.columns.filter(column => column.caption != 'table_select'))

</script>
<template>
    <RecycleScroller
        :items="props.items"
        :item-size="props.rowHeight"
        item-class="flex items-center justify-center"
        :class="[{'max-h-[500px]': !props.pageMode}]"
        class="virtual-scroller"
        :key-field="tableUid + '_uid'"
        v-slot="{ item, index }"
        :buffer="props.pageMode ? 1500 : 200"
        :page-mode="props.pageMode"
    >

        <RowElement
            :item="item"
            :index="index"
            :columns="props.columns"
            :selectable="selectable"
            :item-count="props.items.length"
            :row-height="props.rowHeight"
            :dark="props.dark"
            :scroll="props.scroll"
        >
            <template v-for="column in filteredColumns" #[column.slotName]="{item}">
                <slot
                    :name="column.slotName"
                    :item="item"
                />
            </template>
        </RowElement>

    </RecycleScroller>
    
</template>
<style scoped>
.virtual-scroller :deep(td), .virtual-scroller :deep(.header-prefix) {
    @apply py-1 pl-2 pr-3 text-sm 
}

.virtual-scroller :deep(.item-smooth) {
    -webkit-font-smoothing: subpixel-antialiased;
    -webkit-transform: translateZ(0) scale(1.0, 1.0);
}

.virtual-scroller {
    @apply w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-400 scrollbar-track-transparent
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