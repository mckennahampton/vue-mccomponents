<script setup lang="ts" generic="T">
import uid from '../../Utilities/uid'
import RowElement from './RowElement.vue'
import EmptyItemsRow from './EmptyItemsRow.vue'
import TransitionListPage from './Transitions/TransitionListPage.vue'
import { inject, ref, onMounted, ComputedRef, computed, watch } from 'vue'
import { type InternalColumn, type ItemWithUid, type RowActionButtonConfig } from '../TableTypes'


interface Props<T> {
    items: ItemWithUid<T>[],
    columns: InternalColumn[],
    rowClasses?: string | object | any[],
    scroll: boolean,
    loading: boolean,
    dark: boolean,
    externalPagination: boolean,
    rowActionButtonConfig?: RowActionButtonConfig
}

const props = defineProps<Props<T>>()

const filtered = inject('filtered') as ComputedRef<boolean>
const selectable = inject('selectable') as boolean
const currentPage = inject('currentPage') as ComputedRef
const tableUid = inject('tableUid') as string
const pageStepDirection = inject('pageStepDirection') as ComputedRef<'forwards' | 'backwards' | 'none' | 'initial'>
const rowsPerPage = inject('rowsPerPage') as ComputedRef<number>

const tableRowRef = ref(null)
const tableRowHeight = ref(30)
onMounted(() => {
    tableRowHeight.value = document.querySelector<HTMLElement>(`#${tableUid}_tbody tr:nth-child(1)`)?.offsetHeight ?? 0
})

const filteredColumns = computed(() => props.columns.filter(column => column.caption != 'table_select'))

const pageUid = ref(uid())
const pageKey = computed(() => {
    return props.externalPagination
    ? pageUid.value
    : currentPage.value + (props.items.length > 0 ? 1 : 0)
})

watch(() => props.items, (newParams, oldParams) => {
    if (!newParams.every(item => oldParams.includes(item))) pageUid.value = uid()
})

const listKey = computed(() => {
    return filtered.value
    ? props.items.toString()
    : (props.items.length > 0 ? 1 : 0) + rowsPerPage.value
})
</script>
<template>
    <TransitionListPage
        :direction="pageStepDirection"
        :page-key="pageKey"
        :items-length="props.items.length"
        :css="props.items.length < 200"
        :loading="props.loading"
        :columns="props.columns"
        :key="listKey"
        :scroll="props.scroll"
    >
        <RowElement v-if="props.items.length > 0" v-for="(item, index) in props.items"
            :item="item"
            :index="index"
            :columns="props.columns"
            :selectable="selectable"
            :item-count="props.items.length"
            :key="!filtered && item[tableUid + '_uid']"
            :dark="props.dark"
            :scroll="props.scroll"
            :row-classes="props.rowClasses"
            :row-action-button-config="props.rowActionButtonConfig"
            ref="tableRowRef"
        >
            <template v-for="column in filteredColumns" #[column.cellSlotName]="{item}">
                <slot
                    :name="column.cellSlotName"
                    :item="item"
                    :index="index"
                />
            </template>
        </RowElement>
        <EmptyItemsRow v-else :colspan="(selectable) ? props.columns.length + 1 : props.columns.length" />
    </TransitionListPage>
    
</template>
<style scoped>
:deep(.header-prefix) {
    @apply py-1 pl-2
}
</style>