<script setup lang="ts">
import uid from '../Utilities/uid'
import { useElementSize } from '@vueuse/core'
import RowListHandler from './Row/RowListHandler.vue'
import { deepValue } from '../Utilities/objectHelpers'
import VirtualScroller from './Row/VirtualScroller.vue'
import HeaderElements from './Header/HeaderElements.vue'
import HeaderSelectAll from './Header/HeaderSelectAll.vue'
import TableToolbar from './TableToolbar/TableToolbar.vue'
import { type OrderByEntry } from './TableToolbar/Filters/OrderBy.vue'
import { type LengthAwarePaginator } from '../Types/Laravel/LengthAwarePaginator'
import { ref, onBeforeMount, computed, watch, useSlots, provide, reactive, onMounted, type Ref } from 'vue'

//#region Types

export interface ExternalPaginationFetchArgs {
    page: number,
    rows: number,
    start?: Date,
    end?: Date
}

export interface CellOptions {
    classes?: string | any[] | object,
    suggestedWidth?: number,
    ellipse?: boolean,
    useMinimumSpace?: boolean,
}

export interface Column {
    caption: string,
    key: string,
    classes?: string | any[] | object,
    cellOptions?: CellOptions,
    sort?: boolean,
}

export interface InternalColumn extends Column {
    uid: string,
    width: number,
    slotName: string,
    useExplicitWidth: boolean,
}

interface FilterValue {
    value: string | number | boolean | null,
    title?: string,
    active?: boolean,
}

interface Filter {
    metric: string,
    values: FilterValue[],
    current?: string | null,
    searchable?: boolean,
    label?: string,
}

interface Props {
    toolbar?: boolean,
    rowHandling?: 'paginate' | 'scroll'
    columns: Column[],
    items: any[],
    sort?: boolean,
    resize?: boolean,
    selectable?: boolean,
    scrollableMaxHeight?: number,
    rowClasses?: string,
    loading?: boolean,
    externalPagination?: false | LengthAwarePaginator,
    showDatePicker?: boolean,
    filters?: Filter[],
    reportTitle?: string,
    showExport?: boolean,
    orderBy?: OrderByEntry[],
    itemUid?: string,
    dark?: boolean,
    localLogoUrl?: string,
}
//#endregion

const props = withDefaults(defineProps<Props>(), {
    toolbar: true,
    showToolbar: true,
    loading: false,
    externalPagination: false,
    showDatePicker: false,
    showExport: false,
    sort: true,
    resize: true,
    selectable: false,
    dark: false,
    rowHandling: 'paginate'
})

const emit = defineEmits([
    'navigate-to',
])

const slots = useSlots() // Used to conditional rendering of the action button slot

//#region Provided Values & Functions
    /**
     * I'm using provide() and inject() to connect the Table with all the different components. At
     * first everything for the table was in this one component, but as I continued adding features
     * the size of the component was getting ridiculous and it needed to be refactored so we could
     * properly manage everything without wanting to go to bed early.
     * 
     * It's not the best pattern to use for building full blown apps, but in this case I think using
     * provide() and inject() made a lot of sense so as to avoid prop drilling and relying on unecessary
     * stores
     */


    // Misc. Props
    const loading = ref(props.loading)
    watch(props, () => loading.value = props.loading)
    onBeforeMount(() => {
        provide('externalPagination', props.externalPagination)
        provide('loading', loading)
        provide('itemUid', props.itemUid ?? false)
    })

    // Table Transition properties
    type Direction = 'forwards' | 'backwards' | 'none'
    const pageStepDirection = ref('forwards' as Direction)
    const isTransitioning = ref(false)
    const updatePageStepDirection = (dir: Direction) => {
        pageStepDirection.value = dir
    }
    const updateIsTransitioning = (val: boolean) => isTransitioning.value = val
    onBeforeMount(() => {
        provide('updatePageStepDirection', updatePageStepDirection)
        provide('pageStepDirection', pageStepDirection)
        provide('isTransitioning', isTransitioning)
        provide('updateIsTransitioning', updateIsTransitioning)
    })

    // Table UID
    const tableUid = uid()
    const tableConUid = uid()
    const tableConRef = ref(null)
    onBeforeMount(() => {
        provide('tableUid', tableUid)
        provide('tableConUid', tableConUid)
        provide('tableConRef', tableConRef)
    })
    // *******************************************************************


    // Table tempalte ref
    const tableRef = ref(null) as Ref<HTMLElement | null>
    const { width: tableWidth } = useElementSize(tableRef)
    onBeforeMount(() => {
        provide('tableRef', tableRef)
    })
    // *******************************************************************


    // Paginate data
    const totalItems = computed(() => {
        return props.externalPagination
        ? props.externalPagination.total
        : props.items.length
    })
    onBeforeMount(() => {
        provide('totalItemsLength', totalItems)
    })
    // *******************************************************************


    // Quick Filter
    const quickFilter = ref('')
    const updateQuickFilter = (val: string) => {
        quickFilter.value = val
        currentPage.value = 1
    }
    const filtered = computed(() => {
        return Boolean(quickFilter.value)
    })
    onBeforeMount(() => {
        provide('filtered', filtered)
        provide('updateQuickFilter', updateQuickFilter)
    })
    // *******************************************************************


    // Rows Per Page
    const rowsPerPage = ref(10)
    const updateRowsPerPage = (length: number) => {

        if (length > 50) columns.value.forEach(column => column.useExplicitWidth = true)
        else columns.value.forEach(column => column.useExplicitWidth = false)

        rowsPerPage.value = length
        currentPage.value = 1
        updatePageStepDirection('none')
    }
    onBeforeMount(() => {
        provide('rowsPerPage', rowsPerPage)
        provide('updateRowsPerPage', updateRowsPerPage)
    })
    // *******************************************************************


    // Current Page
    const currentPage = ref(1)
    const updateCurrentPage = (page: number) => {
        currentPage.value < page
        ? updatePageStepDirection('forwards')
        : updatePageStepDirection('backwards')

        currentPage.value = page
    }
    onBeforeMount(() => {
        provide('currentPage', currentPage)
        provide('updateCurrentPage', updateCurrentPage)
    })
    // *******************************************************************


    // Start & End Dates
    const endDate = ref(new Date)
    const dirtyEndDate = ref(new Date)
    const startDate = ref(new Date)
    const dirtyStartDate = ref(new Date)
    const updateEndDate = (val: string) => {
        dirtyEndDate.value = new Date(val)
    }
    const updateStartDate = (val: string) => {
        dirtyStartDate.value = new Date(val)
    }
    onBeforeMount(() => {
        startDate.value.setMonth(endDate.value.getMonth() - 1)
        dirtyStartDate.value.setMonth(endDate.value.getMonth() - 1)
        provide('startDate', startDate)
        provide('dirtyStartDate', dirtyStartDate)
        provide('endDate', endDate)
        provide('dirtyEndDate', dirtyEndDate)
        provide('updateStartDate', updateStartDate)
        provide('updateEndDate', updateEndDate)
    })
    // *******************************************************************


    // Laravel query filters
    export interface LaravelFormattedFilter {
        metric: string,
        value: any
    }
    const laravelFormattedFilters = ref([] as LaravelFormattedFilter[])
    const dirtyFormattedFilters = ref([] as LaravelFormattedFilter[])
    const updateLaravelFormattedFilters = (vals: LaravelFormattedFilter[]) => {
        dirtyFormattedFilters.value = vals
    }
    onBeforeMount(() => {
        provide('laravelFormattedFilters', laravelFormattedFilters)
        provide('updateLaravelFormattedFilters', updateLaravelFormattedFilters)
    })
    // *******************************************************************

    // Laravel order by entries
    export interface LaravelFormattedOrderBy {
        title?: string,
        metric: string,
        dir: 'asc' | 'desc'
    }
    const laravelFormattedOrderBy = ref({} as LaravelFormattedOrderBy)
    const dirtlaravelFormattedOrderBy = ref({} as LaravelFormattedOrderBy)
    const updateLaravelFormattedOrderBy = (entry: LaravelFormattedOrderBy) => {
        if (!entry) dirtlaravelFormattedOrderBy.value = {} as LaravelFormattedOrderBy
        else if (entry.metric == 'none') dirtlaravelFormattedOrderBy.value = {} as LaravelFormattedOrderBy
        else dirtlaravelFormattedOrderBy.value = entry
    }
    onBeforeMount(() => {
        provide('orderByEntries', props.orderBy)
        provide('laravelFormattedOrderBy', laravelFormattedOrderBy)
        provide('updateLaravelFormattedOrderBy', updateLaravelFormattedOrderBy)
    })
    // *******************************************************************


    // Sorting
    const sortAsc = ref(false)
    const toggleSortDir = () => {
        sortAsc.value = !sortAsc.value
    }
    const sortingMetric = ref(null)
    const updateSortingMetric = (metric: string) => {
        //@ts-ignore
        sortingMetric.value = metric
    }
    const sorting = ref(false)
    const updateSorting = (val: boolean) => {
        sorting.value = val
    }
    onBeforeMount(() => {
        provide('sortAsc', sortAsc),
        provide('sortingMetric', sortingMetric)
        provide('sorting', sorting)
        provide('toggleSortDir', toggleSortDir)
        provide('updateSortingMetric', updateSortingMetric)
        provide('updateSorting', updateSorting)
    })
    const resetSort = () => {
        if (props.sort)
        {
            sorting.value = false
            sortAsc.value = false
        }
    }
    // *******************************************************************

    // Selectable
    export interface SelectState {
        [key: string]: boolean,
    }
    const itemsWithUid = ref([] as any[])
    const selectState = reactive({} as SelectState)
    const preparePropItems = () => {

        //@ts-ignore
        itemsWithUid.value = props.items.map((item, index) => ({
            ...item,
            [tableUid + '_uid']: props.itemUid ? item[props.itemUid] : uid(),
        }))

        //@ts-ignore
        itemsWithUid.value.forEach((item, index)=> {
            //@ts-ignore
            selectState[item[tableUid + '_uid']] = false
        })
    }

    // Reactively update the internal table items when the props change
    onBeforeMount(() => preparePropItems())
    watch(() => props.items, () => preparePropItems())

    const selectedCount = computed(() => Object.values(selectState).filter(e => e).length)
    const allDisabled = computed(() => pageItems.value.filter(item => item.disabled).length == pageItems.value.length)
    const allSelected = computed(() => pageItems.value.filter(item => !item.disabled).length == selectedCount.value && pageItems.value.filter(item => !item.disabled).length > 0)

    const selectedItems = computed(() => {
        // Remove the uid key in the exposed selectedItems array
        return itemsWithUid.value.filter(item => selectState[item[tableUid + '_uid']]).map(item => {
            const o = {...item}
            if (tableUid + '_uid' in o) delete o[tableUid + '_uid']
            return o
        })
    })

    const toggleSelectItem = (item: any) => {
        if (item.disabled) return
        selectState[item[tableUid + '_uid']] = !selectState[item[tableUid + '_uid']]
    }
    const deselectAll = () => {
        Object.keys(selectState).forEach(k => selectState[k] = false)
    }
    const selectAll = () => {
        pageItems.value.filter(item => !item.disabled).forEach(item => selectState[item[tableUid + '_uid']] = true)
    }
    const toggleSelectAll = () => allSelected.value ? deselectAll() : selectAll()

    onBeforeMount(() => {
        provide('selectable', props.selectable)
        provide('toggleSelectAll', toggleSelectAll)
        provide('allSelected', allSelected)
        provide('toggleSelectItem', toggleSelectItem)
        provide('deselectAll', deselectAll)
        provide('allDisabled', allDisabled)
        provide('selectState', selectState)
    })

    watch(() => props.items, () => deselectAll())
    watch(currentPage, () => deselectAll())
    watch(rowsPerPage, () => deselectAll())
    // *******************************************************************

    // Resizing
    const columns = ref([] as InternalColumn[])
    onBeforeMount(() => {
        props.columns.forEach(column => {
            columns.value.push({
                ...column,
                width: 0,
                uid: uid(),
                slotName: `cell(${column.key})`,
                useExplicitWidth: false,
                ...(!column.hasOwnProperty('sort')) && {
                    sort: true,
                },
            })
        })
        if (props.selectable) columns.value.push({
            uid: uid(),
            width: 0,
            caption: 'table_select',
            slotName: `cell(table_select)`,
            useExplicitWidth: false,
            key: 'table_select',
            sort: false,
        })
    })
    const filteredColumns = computed(() => columns.value.filter(column=> column.caption != 'table_select'))

    const virtualScroller = ref(null)
    const { height: virtualScrollerHeight } = useElementSize(virtualScroller)
    const resizing = ref(false)
    const rowHeight = ref(0)
    const updateRowHeight = (val: number) => rowHeight.value = val
    const updateResizing = (val: boolean) => {
        // Delay to avoid selecting everything at the last second
        if (!val) {
            setTimeout(() => {
                resizing.value = val
            }, 200)
        }
        else {
            resizing.value = val
        }
    }

    const updateInnerColumnThSize = (uid: string, width: number) => {
        let temp = columns.value.find(column => column.uid == uid)
        if (temp) {
            temp.width = width
        }
    }

    const updateColumnsOnTableWidthChange = () => {
        filteredColumns.value.forEach(column => {
            let th = document.querySelector(`[data-th="${column.uid}"]`)
            column.width = th?.getBoundingClientRect().width ?? 0
        })
    }

    watch(tableWidth, () => {
        if (tableWidth.value) updateColumnsOnTableWidthChange()
    })

    const initialTableMount = ref(false)
    const scrollable = computed(() => {
        return initialTableMount.value && rowHeight.value > 0 && !columns.value.some(column => column.width == 0)
        ? props.rowHandling == 'scroll' || pageItems.value.length > 50
        : false
    })

    onMounted(() => {
        if (props.rowHandling == 'scroll') columns.value.forEach(column => column.useExplicitWidth = true)
        initialTableMount.value = true
    })

    onBeforeMount(() => {
        provide('updateResizing', updateResizing)
        provide('updateRowHeight', updateRowHeight)
        provide('updateInnerColumnThSize', updateInnerColumnThSize)
        provide('resizing', resizing),
        provide('virtualScrollerHeight', virtualScrollerHeight)
    })
    // *******************************************************************

    onBeforeMount(() => {
        provide('localLogoUrl', props.localLogoUrl)
        provide('columns', props.columns)
    })


//#endregion


// Filtering & sorting works with nested "."-spaced values, i.e. {sort: 'type.caption.name'} will sort/filter by type.caption.name
//
// The key to this is the sortingMetric.value.split('.').reduce((p,c)=>p&&p[c]||'', a), where we iterate over the .-spaced string to
// find the nested value we are looking for
const filteredItems = computed(() => {
    return !filtered.value
    ? itemsWithUid.value
    : itemsWithUid.value.filter((item) => {
        return Object.keys(item).some((key) => {
            if (key == 'hash' || key == 'icon' || key == 'path') return false
            return item[key]
            ? item[key].toString().toLowerCase().includes(quickFilter.value.toString().toLowerCase())
            : props.columns.some(column => {
                return column.key
                ? deepValue(column.key, item).toString().toLowerCase().includes(quickFilter.value.toString().toLowerCase())
                : false
            });
        })
    })

})
const pageItems = computed(() => {
    let items;

    // If items need to be paginated, slice only the current page's items
    // If we are using external pagination, then the provided items are already
    // chunked to the page size, so we don't need to do anything
    if (!props.externalPagination && props.rowHandling == 'paginate')
    {
        let start = (currentPage.value - 1) * rowsPerPage.value
        let end = start + rowsPerPage.value
        items = filteredItems.value.slice(start, end)
    }
    else {
        if (initialTableMount.value) {
            items = filteredItems.value
        }
        else {
            items = filteredItems.value.slice(0, 10)
        }
    }

    // Sort the items if applicable
    if (props.sort && sorting.value) {
        items.sort((a: object, b: object) => {

            let alpha = sortAsc.value ? a : b
            let beta = !sortAsc.value ? a : b

            //@ts-ignore
            return typeof deepValue(sortingMetric.value, alpha) == 'number'
            //@ts-ignore
            ? deepValue(sortingMetric.value, alpha) - deepValue(sortingMetric.value, beta)
            //@ts-ignore
            : deepValue(sortingMetric.value, alpha)
                .toString()
                //@ts-ignore
                .localeCompare(deepValue(sortingMetric.value, beta).toString(), undefined, { numeric: true })

        })
    }
    return items
})
onBeforeMount(() => {
    provide('filteredItems', filteredItems)
    provide('filtered', filtered)
})

const navigateTo = (page: number) => {

    updateCurrentPage(page)
    laravelFormattedFilters.value = dirtyFormattedFilters.value
    laravelFormattedOrderBy.value = dirtlaravelFormattedOrderBy.value
    startDate.value = dirtyStartDate.value
    endDate.value = dirtyEndDate.value

    if (props.externalPagination) {
        let data = {
            page: page,
            rows: rowsPerPage.value,

            // Include the start & end dates if the table has a Date Picker
            ...(props.showDatePicker && {
                start: startDate.value.toLocaleString(),
                end: endDate.value.toLocaleString(),
            }),

            // Include any active filters
            ...(laravelFormattedFilters.value && {
                filters: laravelFormattedFilters.value
            }),

            // Include order by if active
            ...(laravelFormattedOrderBy.value && {
                orderBy: laravelFormattedOrderBy.value.metric,
                orderDir: laravelFormattedOrderBy.value.dir,
            }),
        }
        emit('navigate-to', data)
    }
}
provide('navigateTo', navigateTo)

// Expose refresh method so we can manually refresh the table when necessary
// from the parent component. Only relevant when working with external pagination
// and the sorce data was updated
const refresh = (firstPage = false) => {
    if (firstPage) currentPage.value = 1
    navigateTo(currentPage.value)
}
defineExpose({
    refresh,
    selectedItems,
    quickFilter
})

// Behavioral cleanup
onBeforeMount(() => {
    if (props.rowHandling == 'paginate') {
        resetSort()
        if (props.selectable) {
            deselectAll()
        }
    }
})

// Update displayed items on prop items change
const sort = (metric: string) => {
    if(props.sort) {
        //@ts-ignore
        sortingMetric.value = metric
        sorting.value = true
        sortAsc.value = !sortAsc.value
    }
}
watch(props, () => {

    // Re-sort if items are already sorted
    if (sorting.value) {
        sortAsc.value = !sortAsc.value
        //@ts-ignore
        sort(sortingMetric.value)
    }
    if(!props.externalPagination) currentPage.value = 1

})

</script>
<template>
    <TableToolbar
        :paginate="props.rowHandling == 'paginate'"
        :toolbar="props.toolbar"
        :external-pagination="props.externalPagination"
        :show-date-picker="props.showDatePicker"
        :show-export="props.showExport"
        :report-title="props.reportTitle"
        :filters="props.filters"
        :loading="props.loading"
        @reset-sort="resetSort"
        :items="pageItems"
        :dark="props.dark"
    >
        <template #actionButton v-if="slots.actionButton">
            <slot name="actionButton" :selectedItems="selectedItems" />
        </template>

        <template #table>
            <div
                class="w-full relative"
                :class="[
                    // {'overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-400 scrollbar-track-transparent border-y-2 border-t-neutral-200': props.rowHandling == 'scroll'},
                    {'overflow-y-hidden': !scrollable},
                    {'!h-auto': scrollable}
                ]"

                :id="tableConUid"
                ref="tableConRef"
            >
                <table
                    :class="[
                        {'select-none': resizing},
                        {'!block': scrollable}
                    ]"
                    class="overflow-x-clip"
                    ref="tableRef"
                    v-bind="$attrs"
                    :id="tableUid"
                    data-regular-scroller
                    :style="{
                        ...(scrollable && {
                            //width: tableWidth + 'px'
                        })
                    }"
                >
                    <thead
                        ref="thead"
                        class="border-y-2 max-md:hidden z-[2] relative"
                        :class="[
                            {'sticky -top-[1px]': props.rowHandling == 'scroll'},
                            {'flex flex-col': scrollable},
                            {'border-y-neutral-200': !props.dark},
                            {'border-y-neutral-800': props.dark}
                        ]"
                    >
                        <tr>
                            <HeaderElements v-for="(column, index) in columns"
                                :resize="props.resize"
                                :selectable="props.selectable"
                                :column="column"
                                :sort="props.sort"
                                :index="index"
                                :item-count="pageItems.length"
                                :rows-per-page="rowsPerPage"
                                :dark="props.dark"
                                :is-last="(index + (props.selectable ? 2 : 1)) == columns.length"
                                :scrollable="scrollable"
                            />

                            <HeaderSelectAll v-if="props.selectable"
                                :page-items="pageItems"
                                :class="{'bg-white': scrollable && !props.dark}"
                                :dark="props.dark"
                                :column="columns[columns.length - 1]"
                                :scroll="scrollable"
                            />
                        </tr>
                    </thead>

                    <RowListHandler v-if="!scrollable"
                        :columns="columns"
                        :items="pageItems"
                        :row-classes="props.rowClasses"
                        :loading="props.loading"
                        :dark="props.dark"
                        :scroll="scrollable"
                    >
                        <template v-for="column in filteredColumns" #[column.slotName]="{item}">
                            <slot
                                :name="column.slotName"
                                :item="item"
                            />
                        </template>
                    </RowListHandler>
                </table>
            </div>
            <VirtualScroller v-if="scrollable"
                :items="pageItems"
                :columns="columns"
                :row-classes="props.rowClasses"
                :loading="props.loading"
                :row-height="rowHeight"
                :dark="props.dark"
                :page-mode="props.rowHandling != 'scroll'"
                :scroll="scrollable"
                ref="virtualScroller"
            >
                <template v-for="column in filteredColumns" #[column.slotName]="{item}">
                    <slot
                        :name="column.slotName"
                        :item="item"
                    />
                </template>
            </VirtualScroller>
        </template>

        <template v-if="slots.footer" #footer="{items}">
            <slot name="footer" :items="items" />
        </template>

    </TableToolbar>

</template>
<style scoped>

table {
    @apply
    w-full table-auto text-left
    
    /* Responsive*/
    block md:table
    
    /* Print */
    print:table print:visible print:w-screen print:!text-black print:[&_*]:!text-black
}

/* thead */
thead {
    @apply
    text-[15px] border-t-[1px]

    /* Responsive - Each cell will have a prefix with the header caption */
    /* hidden md:table-header-group */

    /* Print */
    print:table-header-group
}

/* tbody */
table :deep(tbody) {
    @apply

    flex flex-col gap-5 items-center
    justify-center overflow-hidden

    md:table-row-group md:float-none md:overflow-x-hidden
    print:table-row-group print:float-none print:overflow-x-hidden
}

/* td */

table :deep(tbody tr td.selectButton),
table :deep(thead tr th.selectButton) {
    @apply

    /* Mobile */
    flex w-full text-sm p-0

    /* Desktop */
    md:table-cell md:py-1 md:pl-2
    print:table-cell print:w-auto print:py-1 print:pl-2

}


/* #region Row Transitions */

.rows-enter-active,
.rows-leave-active {
    transition: all 0.2s ease;
    overflow-x: hidden;
}
.rows-leave-active {
    display:none
}
.rows-enter-from,
.rows-leave-to {
  opacity: 0;
  /* transform: translateX(30px); */
}

/* #endregion */

/* #region Print styles */

table :deep(svg),
table :deep([data-dropdown-button])
{
    @apply print:hidden
}

/* #endregion */
</style>