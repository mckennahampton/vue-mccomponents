<script setup lang="ts">
import uid from '../../Utilities/uid'
import RowElement from './RowElement.vue'
import EmptyItemsRow from './EmptyItemsRow.vue'
import { type InternalColumn } from '../Table.vue'
import TransitionListPage from './Transitions/TransitionListPage.vue'
import { inject, ref, onMounted, ComputedRef, computed, watch } from 'vue'

interface Props {
    items: any[],
    columns: InternalColumn[],
    rowClasses?: string | object | any[],
    scroll: boolean,
    loading: boolean,
    dark: boolean,
    externalPagination: boolean,
}

const props = defineProps<Props>()

const filtered = inject('filtered') as ComputedRef<boolean>
const selectable = inject('selectable') as boolean
const currentPage = inject('currentPage') as ComputedRef
const tableUid = inject('tableUid') as string
const pageStepDirection = inject('pageStepDirection') as ComputedRef<'forwards' | 'backwards'>
const rowsPerPage = inject('rowsPerPage') as ComputedRef<number>

const tableRowRef = ref(null)
const tableRowHeight = ref(30)
onMounted(() => {
    //@ts-ignore
    tableRowHeight.value = document.querySelector(`#${tableUid}_tbody tr:nth-child(1)`)?.offsetHeight ?? 0
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
            ref="tableRowRef"
        >
            <template v-for="column in filteredColumns" #[column.cellSlotName]="{item}">
                <slot
                    :name="column.cellSlotName"
                    :item="item"
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