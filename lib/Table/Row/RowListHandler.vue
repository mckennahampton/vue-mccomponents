<script setup lang="ts">
import RowElement from './RowElement.vue'
import EmptyItemsRow from './EmptyItemsRow.vue'
import { type InternalColumn } from '../Table.vue'
import { inject, ref, onMounted, ComputedRef, computed } from 'vue'
import TransitionListPage from './Transitions/TransitionListPage.vue'

interface Props {
    items: any[],
    columns: InternalColumn[],
    rowClasses?: string | object | any[],
    scroll: boolean,
    loading: boolean,
    dark: boolean,
}
const props = defineProps<Props>()

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


</script>
<template>
    <TransitionListPage
        :direction="pageStepDirection"
        :page-key="currentPage + (props.items.length > 0 ? 1 : 0)"
        :items-length="props.items.length"
        :css="props.items.length < 200"
        :loading="props.loading"
        :columns="props.columns"
        :key="(props.items.length > 0 ? 1 : 0) + rowsPerPage"
    >
        <RowElement v-if="props.items.length > 0" v-for="(item, index) in props.items"
            :item="item"
            :index="index"
            :columns="props.columns"
            :selectable="selectable"
            :item-count="props.items.length"
            :key="item[tableUid + '_uid']"
            ref="tableRowRef"
            :dark="props.dark"
        >
            <template v-for="column in filteredColumns" #[column.slotName]="{item}">
                <slot
                    :name="column.slotName"
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