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

export interface ExportOptions {
    isDate?: boolean,
    dateFormat?: 'timestampToISO' | 'timestampToLocaleTime' | 'timestampToLocaleDate' | 'timestampToFullFormatted' | 'timestampToAbreviatedDate'
    skip?: boolean,
}

export interface ExportConfig {
    csv?: boolean,
    pdf?: boolean,
    print?: boolean,
    reportTitle?: string,
}

export interface Column {
    caption: string,
    captionProps?: any,
    key: string,
    classes?: string | any[] | object,
    cellOptions?: CellOptions,
    exportOptions?: ExportOptions,
    sort?: boolean,
}

export interface InternalColumn extends Column {
    uid: string,
    width: number,
    cellSlotName: string,
    headerSlotName: string,
    headerHasSlotContent: boolean,
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
    dark?: boolean,
    toolbar?: boolean,
    rowHandling?: 'paginate' | 'scroll'
    columns: Column[],
    items?: any[],
    sort?: boolean,
    resize?: boolean,
    selectable?: boolean,
    scrollableMaxHeight?: number,
    rowClasses?: string,
    loading?: boolean,
    externalPagination?: false | LengthAwarePaginator,
    showDatePicker?: boolean,
    filters?: Filter[],
    showExport?: boolean,
    exportConfig?: ExportConfig,
    orderBy?: OrderByEntry[],
    itemUid?: string,
    defaultRowsPerPage?: 10 | 20 | 50 | 'all',
    toolbarClasses?: any,
}
//#endregion

const props = withDefaults(defineProps<Props>(), {
    toolbar: true,
    loading: false,
    externalPagination: false,
    showDatePicker: false,
    showExport: false,
    sort: true,
    resize: true,
    selectable: false,
    defaultRowsPerPage: 10,
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
    type Direction = 'forwards' | 'backwards' | 'none' | 'initial'
    const pageStepDirection = ref('initial' as Direction)
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


    // Table template ref
    const tableRef = ref(null) as Ref<HTMLElement | null>
    const { width: tableWidth } = useElementSize(tableRef)
    onBeforeMount(() => provide('tableRef', tableRef))
    // *******************************************************************


    // Paginate data
    const totalItems = computed(() => {
        return props.externalPagination
        ? props.externalPagination.total
        : props.items?.length
    })
    onBeforeMount(() => provide('totalItemsLength', totalItems))
    // *******************************************************************


    // Quick Filter
    const quickFilter = ref('')
    const updateQuickFilter = (val: string) => {
        let timer
        clearTimeout(timer)
        timer = setTimeout(() => {
            quickFilter.value = val
            currentPage.value = 1
        }, 100)
    }
    const filtered = computed(() => Boolean(quickFilter.value))
    onBeforeMount(() => {
        provide('filtered', filtered)
        provide('updateQuickFilter', updateQuickFilter)
    })
    // *******************************************************************


    // Rows Per Page
    const rowsPerPage = ref(props.defaultRowsPerPage == 'all' ? 51 : props.defaultRowsPerPage)
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
    const updateEndDate = (val: string) => dirtyEndDate.value = new Date(val)
    const updateStartDate = (val: string) => dirtyStartDate.value = new Date(val)
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
    const updateLaravelFormattedFilters = (vals: LaravelFormattedFilter[]) => dirtyFormattedFilters.value = vals
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
    const dirtyLaravelFormattedOrderBy = ref({} as LaravelFormattedOrderBy)
    const updateLaravelFormattedOrderBy = (entry: LaravelFormattedOrderBy) => {
        if (!entry) dirtyLaravelFormattedOrderBy.value = {} as LaravelFormattedOrderBy
        else if (entry.metric == 'none') dirtyLaravelFormattedOrderBy.value = {} as LaravelFormattedOrderBy
        else dirtyLaravelFormattedOrderBy.value = entry
    }

    const laravelExternalPaginationArgs = computed(() => ({
        page: currentPage.value,
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
    }))

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
    const sortingMetric = ref('')
    const updateSortingMetric = (metric: string) => sortingMetric.value = metric
    const sorting = ref(false)
    const updateSorting = (val: boolean) => sorting.value = val
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
    const selectState = reactive({} as any)
    const preparePropItems = () => {
        itemsWithUid.value = []
        itemsWithUid.value = props.items?.map((item, index) => ({
            ...item,
            [tableUid + '_uid']: props.itemUid ? item[props.itemUid] : uid(),
        })) ?? []

        itemsWithUid.value.forEach((item, index) => selectState[item[tableUid + '_uid']] = false)
    }

    // This is critical for properly rendering item changes. If a specific item UID key is provided,
    // then this key will only change when the list of items grows/shrinks. If no UID key is provided,
    // this key changes every time the prop items change at all
    // External pagination doesn't need this list key to change
    const listKey = computed(() => {
        if (props.externalPagination) return 1
        else
        {
            let temp = itemsWithUid.value.map(item => item[tableUid + '_uid'])
            temp.sort()
            return temp.toString()
        }
    })

    // Reactively update the internal table items when the props change
    onBeforeMount(() => preparePropItems())
    watch(() => props.items, (newItems, oldItems) => preparePropItems())

    const selectedCount = computed(() => Object.values(selectState).filter(e => e).length)
    const allDisabled = computed(() => pageItems.value.filter(item => item.disabled).length == pageItems.value.length)
    const allSelected = computed(() => pageItems.value.filter(item => !item.disabled).length == selectedCount.value && pageItems.value.filter(item => !item.disabled).length > 0)

    const selectedItems = computed(() => {
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
        // provide('itemIsSelected', itemIsSelected)
        provide('deselectAll', deselectAll)
        provide('allDisabled', allDisabled)
        provide('selectState', selectState)
    })

    watch(props, () => deselectAll())
    watch(currentPage, () => deselectAll())
    watch(rowsPerPage, () => deselectAll())
    // *******************************************************************

    // Resizing
    const columns = ref([] as InternalColumn[])
    onBeforeMount(() => {
        props.columns.forEach(column => {
            columns.value.push({
                //@ts-ignore
                caption: column.caption,
                width: 0,
                uid: uid(),
                cellSlotName: `cell(${column.key})`,
                headerSlotName: `header(${column.key})`,
                headerHasSlotContent: Boolean(slots[`header(${column.key})`]),
                useExplicitWidth: false,
                ...(!column.hasOwnProperty('sort')) && {
                    sort: true,
                },
                ...column,

            })
        })
        if (props.selectable)
        {
            columns.value.push({
                uid: uid(),
                width: 60,
                caption: 'table_select',
                cellSlotName: `cell(table_select)`,
                headerSlotName: `header(table_select)`,
                headerHasSlotContent: false,
                useExplicitWidth: false,
                key: 'table_select',
                sort: false,
            })
        }
    })
    const filteredColumns = computed(() => columns.value.filter(column=> column.caption != 'table_select'))

    const virtualScroller = ref(null)
    const { height: virtualScrollerHeight } = useElementSize(virtualScroller)
    const resizing = ref(false)
    const rowHeight = ref(0) // Default to a non-zero number to allow the Virtual Scroller to properly mount
    const updateRowHeight = (val: number) => rowHeight.value = val

    const updateResizing = (val: boolean) => {
        // Delay to avoid selecting everything at the last second
        if (!val) setTimeout(() => resizing.value = val, 200)
        else resizing.value = val
    }

    const updateInnerColumnThSize = (uid: string, width: number) => {
        let temp = columns.value.find(column => column.uid == uid)
        if (temp) temp.width = width
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
        provide('propsScroll', props.rowHandling == 'scroll')
        provide('updateResizing', updateResizing)
        provide('updateRowHeight', updateRowHeight)
        provide('updateInnerColumnThSize', updateInnerColumnThSize)
        provide('resizing', resizing),
        provide('virtualScrollerHeight', virtualScrollerHeight)
    })
    // *******************************************************************

    // onBeforeMount(() => {
    //     provide('localLogoUrl', props.localLogoUrl)
    //     provide('columns', props.columns)
    // })


//#endregion


// Filtering & sorting works with nested "."-spaced values, i.e. {sort: 'type.caption.name'} will sort/filter by type.caption.name
//
// The key to this is the sortingMetric.value.split('.').reduce((p,c)=>p&&p[c]||'', a), where we iterate over the .-spaced string to
// find the nested value we are looking for
const filteredItems = computed(() => {
    return !quickFilter.value
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

    // If items need to be paginated, "fetch" only the current page's items
    // If we are using external pagination, then the provided items are already
    // chunked to the page size, so we don't need to do anything
    if (!props.externalPagination && props.rowHandling == 'paginate' && !filtered.value)
    {
        let start = (currentPage.value - 1) * rowsPerPage.value
        let end = start + rowsPerPage.value
        items = filteredItems.value.slice(start, end)
    }
    else {
        console.log({
            e: props.externalPagination,
            r: props.rowHandling,
            f: filtered.value
        })
        if (initialTableMount.value) items = filteredItems.value
        else items = filteredItems.value.slice(0, 10)
    }

    // Sort the items if applicable
    if (props.sort && sorting.value) {
        items.sort((a: object, b: object) => {

            let alpha = sortAsc.value ? a : b
            let beta = !sortAsc.value ? a : b

            return typeof deepValue(sortingMetric.value, alpha) == 'number'
            ? deepValue(sortingMetric.value, alpha) - deepValue(sortingMetric.value, beta)
            : deepValue(sortingMetric.value, alpha)
                .toString()
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
    laravelFormattedOrderBy.value = dirtyLaravelFormattedOrderBy.value
    startDate.value = dirtyStartDate.value
    endDate.value = dirtyEndDate.value

    if (props.externalPagination) emit('navigate-to', laravelExternalPaginationArgs.value)
}
provide('navigateTo', navigateTo)

// Expose refresh method so we can manually refresh the table when necessary
// from the parent component. Only relevant when working with external pagination
// and the source data was updated
const refresh = (firstPage = false) => {
    if (firstPage) currentPage.value = 1
    navigateTo(currentPage.value)
}
defineExpose({
    refresh,
    selectedItems,
    quickFilter,
    laravelExternalPaginationArgs
})

// Behavioral cleanup
onBeforeMount(() => {
    if (props.rowHandling == 'paginate') {
        resetSort()
        if (props.selectable) deselectAll()
    }
})

// Update displayed items on prop items change
const sort = (metric: string) => {
    if(props.sort) {
        sortingMetric.value = metric
        sorting.value = true
        sortAsc.value = !sortAsc.value
    }
}

watch(props, () => {
    // Re-sort if items are already sorted
    if (sorting.value) {
        sortAsc.value = !sortAsc.value 
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
        :filters="props.filters"
        :loading="props.loading"
        @reset-sort="resetSort"
        :items="pageItems"
        :columns="filteredColumns"
        :export-config="props.exportConfig"
        :toolbar-classes="props.toolbarClasses"
        :dark="props.dark"
    >
        <template #actionButton v-if="slots.actionButton">
            <slot name="actionButton" :selectedItems="selectedItems" />
        </template>

        <template #table>
            <div
                class="w-full relative"
                :class="[
                    {'overflow-y-hidden': !scrollable},
                    {'!h-auto': scrollable}
                ]"

                :id="tableConUid"
                ref="tableConRef"
            >
                <table
                    :class="[{'select-none': resizing}]"
                    class="overflow-x-clip"
                    ref="tableRef"
                    v-bind="$attrs"
                    :id="tableUid"
                    data-regular-scroller
                >
                    <thead
                        ref="thead"
                        class="border-y-2 border-y-neutral-200 max-sm:hidden z-[2] relative"
                        :class="[
                            {'sticky -top-[1px]': props.rowHandling == 'scroll' && pageItems.length > 5},
                            {'flex flex-col': scrollable},
                            {'border-y-neutral-200': !props.dark},
                            {'border-y-neutral-800': props.dark}
                        ]"
                    >
                        <tr>
                            <HeaderElements v-for="(column, index) in filteredColumns"
                                :resize="props.resize"
                                :selectable="props.selectable"
                                :scrollable="scrollable"
                                :column="column"
                                :sort="props.sort"
                                :index="index"
                                :item-count="pageItems.length"
                                :rows-per-page="rowsPerPage"
                                :is-last="(index + (props.selectable ? 2 : 1)) == columns.length"
                                :dark="props.dark"
                            >
                                <template #[column.headerSlotName]>
                                    <slot :name="column.headerSlotName" />
                                </template>
                            </HeaderElements>

                            <HeaderSelectAll v-if="props.selectable"
                                :page-items="pageItems"
                                :class="{'bg-white': scrollable && !props.dark}"
                                :column="columns[columns.length - 1]"
                                :dark="props.dark"
                            />
                        </tr>
                    </thead>

                    <RowListHandler v-if="!scrollable"
                        :columns="columns"
                        :items="pageItems"
                        :row-classes="props.rowClasses"
                        :loading="props.loading"
                        :scroll="scrollable"
                        :external-pagination="Boolean(props.externalPagination)"
                        :key="listKey"
                        :dark="props.dark"
                    >
                        <template v-for="column in filteredColumns" #[column.cellSlotName]="{item}">
                            <slot
                                :name="column.cellSlotName"
                                :item="item"
                            />
                        </template>
                    </RowListHandler>
                </table>
            </div>
            <template v-if="scrollable">
                <VirtualScroller v-if="pageItems.length > 0"
                    :items="pageItems"
                    :columns="columns"
                    :row-classes="props.rowClasses"
                    :loading="props.loading"
                    :row-height="rowHeight"
                    :page-mode="props.rowHandling != 'scroll'"
                    :scroll="scrollable"
                    :item-uid="props.itemUid"
                    :scrollable-max-height="props.scrollableMaxHeight"
                    :dark="props.dark"
                    ref="virtualScroller"
                    :key="JSON.stringify(pageItems)"
                >
                    <template v-for="column in filteredColumns" #[column.cellSlotName]="{item}">
                        <slot
                            :name="column.cellSlotName"
                            :item="item"
                        />
                    </template>
                </VirtualScroller>
                <span v-else class="italic opacity-50 w-full text-center min-h-[60px] flex items-center justify-center bg-neutral-200">No items</span>
            </template>
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