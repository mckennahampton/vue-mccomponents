<script setup lang="ts">
import uid from '../Utilities/uid'
// import { useTableStore } from '@/Stores/tables'
import RowElements from './Row/RowElements.vue'
import EmptyItemsRow from './Row/EmptyItemsRow.vue'
import { deepValue } from '../Utilities/objectHelpers'
import HeaderElements from './Header/HeaderElements.vue'
import HeaderSelectAll from './Header/HeaderSelectAll.vue'
import TableToolbar from './TableToolbar/TableToolbar.vue'
import { type OrderByEntry } from './TableToolbar/Filters/OrderBy.vue'
import { type LengthAwarePaginator } from '../Types/Laravel/LengthAwarePaginator'
import {
    ref, onBeforeMount,
    computed, watch, useSlots, provide
} from 'vue'
import TableRowSkeleton from '../Skeletons/Table/TableRowSkeleton.vue'

//#region Types

export interface ExternalPaginationFetchArgs {
    page: number,
    rows: number,
    start?: Date,
    end?: Date
}

export interface Header {
    caption: string,
    sort?: string,
    filter?: string,
    classes?: string | any[] | object
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
    headers: Header[],
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
    localLogoUrl?: string
}
//#endregion

const props = withDefaults(defineProps<Props>(), {
    toolbar: true,
    loading: false,
    externalPagination: false,
    showDatePicker: false,
    showExport: false,
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

    // Table UID
    const tableUid = uid()
    onBeforeMount(() => {
        provide('tableUid', tableUid)
    })
    // *******************************************************************


    // Table tempalte ref
    const tableRef = ref(null)
    provide('tableRef', tableRef)
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
        rowsPerPage.value = length
    }
    onBeforeMount(() => {
        provide('rowsPerPage', rowsPerPage)
        provide('updateRowsPerPage', updateRowsPerPage)
    })
    // *******************************************************************


    // Current Page
    const currentPage = ref(1)
    const updateCurrentPage = (page: number) => {
        currentPage.value = page
    }
    onBeforeMount(() => {
        provide('currentPage', currentPage)
        provide('updateCurrentPage', updateCurrentPage)
    })
    // *******************************************************************


    // Start & End Dates
    const endDate = ref(new Date)
    const startDate = ref(new Date)
    const updateEndDate = (val: string) => {
        endDate.value = new Date(val)
    }
    const updateStartDate = (val: string) => {
        startDate.value = new Date(val)
    }
    onBeforeMount(() => {
        startDate.value.setMonth(endDate.value.getMonth() - 1)
        provide('startDate', startDate)
        provide('endDate', endDate)
        provide('updateStartDate', updateStartDate)
        provide('updateEndDate', updateEndDate)
    })
    // *******************************************************************


    // Laravel query filters
    interface LaravelFormattedFilter {
        metric: string,
        value: any
    }
    const laravelFormattedFilters = ref([] as LaravelFormattedFilter[])
    const updateLaravelFormattedFilters = (vals: LaravelFormattedFilter[]) => {
        laravelFormattedFilters.value = vals
    }
    onBeforeMount(() => {
        provide('updateLaravelFormattedFilters', updateLaravelFormattedFilters)
    })
    // *******************************************************************

    // Larave order by entries
    interface LaravelFormattedOrderBy {
        metric: string,
        dir: 'asc' | 'desc'
    }
    const laravelFormattedOrderBy = ref({} as LaravelFormattedOrderBy)
    const updateLaravelFormattedOrderBy = (entry: LaravelFormattedOrderBy) => {
        if (!entry) laravelFormattedOrderBy.value = {} as LaravelFormattedOrderBy
        else if (entry.metric == 'none') laravelFormattedOrderBy.value = {} as LaravelFormattedOrderBy
        else laravelFormattedOrderBy.value = entry
    }
    onBeforeMount(() => {
        provide('orderByEntries', props.orderBy)
        provide('updateLaravelFormattedOrderBy', updateLaravelFormattedOrderBy)
    })


    // Sorting
    const sortAsc = ref(false)
    const toggleSortDir = () => {
        sortAsc.value = !sortAsc.value
    }
    const sortingMetric = ref('')
    const updateSortingMetric = (metric: string) => {
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
    const itemsWithUid = ref(props.items.map(item => ({
        ...item,
        [tableUid + '_uid']: uid()
    })))

    const selected = ref([] as number[])
    const allSelected = computed(() => pageItems.value.filter(item => !item.disabled).length == selected.value.length)
    const itemIsSelected = (item: any) => selected.value.some(item_uid => item_uid == item[tableUid + '_uid'])

    const selectedItems = computed(() => {
        console.log({
            items: itemsWithUid.value.filter(item => itemIsSelected(item)),
            mapped: itemsWithUid.value.filter(item => itemIsSelected(item)).map(item => {
                const o = {...item}
                if (tableUid + '_uid' in o) delete o[tableUid + '_uid']
                return o
            })
        })

        // Remove the uid key in the exposed selectedItems array
        return itemsWithUid.value.filter(item => itemIsSelected(item)).map(item => {
            const o = {...item}
            if (tableUid + '_uid' in o) delete o[tableUid + '_uid']
            return o
        })
    })

    const toggleSelectItem = (item: any) => {
        if (item.disabled) return

        selected.value.some(item_uid => item_uid == item[tableUid + '_uid'])
        ? selected.value.splice(selected.value.indexOf(item[tableUid + '_uid']), 1) // De-select
        : selected.value.push(item[tableUid + '_uid'])
    }
    const deselectAll = () => {
        selected.value.length = 0
    }
    const selectAll = () => {
        deselectAll()
        pageItems.value.filter(item => !item.disabled).forEach(item => selected.value.push(item[tableUid + '_uid']))
    }
    const toggleSelectAll = () => allSelected.value ? deselectAll() : selectAll()

    onBeforeMount(() => {
        provide('selectable', props.selectable)
        provide('toggleSelectAll', toggleSelectAll)
        provide('allSelected', allSelected)
        provide('toggleSelectItem', toggleSelectItem)
        provide('itemIsSelected', itemIsSelected)
        provide('deselectAll', deselectAll)
    })

    watch(props, () => deselectAll())
    watch(currentPage, () => deselectAll())
    watch(rowsPerPage, () => deselectAll())
    // *******************************************************************

    // Resizing
    const resizing = ref(false)
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
    onBeforeMount(() => {
        provide('updateResizing', updateResizing)
    })
    // *******************************************************************

    // Exports
    onBeforeMount(() => {
        provide('localLogoUrl', props.localLogoUrl)
        provide('headers', props.headers)
    })

//#endregion


// Filtering & sorting works with nested "."-spaced values, i.e. {sort: 'type.caption.name'} will sort/filter by type.caption.name
//
// The key to this is the sortingMetric.value.split('.').reduce((p,c)=>p&&p[c]||'', a), where we iterate over the .-spaced string to
// find the nested value we are looking for

const pageItems = computed(() => {
    let items;

    // Filter the items if applicable
    if (filtered.value) {
        items = itemsWithUid.value.filter((item) => {
            return Object.keys(item).some((key) => {
                if (key == 'hash' || key == 'icon' || key == 'path') return false
                return item[key]
                ? item[key].toString().toLowerCase().includes(quickFilter.value.toString().toLowerCase())
                : props.headers.some(header => {
                    return header.filter
                    ? deepValue(header.filter, item).toString().toLowerCase().includes(quickFilter.value.toString().toLowerCase())
                    : false
                });
            })
        })
    }
    else {
        if (props.externalPagination || props.rowHandling == 'scroll')
        {
            items = itemsWithUid.value
        }
        else {
            let start = (currentPage.value - 1) * rowsPerPage.value
            let end = start + rowsPerPage.value
            items = itemsWithUid.value.slice(start, end)
        }
    }

    // Sort the items if applicable
    if (props.sort) {
        if(sorting.value) {
            items.sort((a: object, b: object) => {

                const options = { numeric: true };
                if (!sortAsc.value) {
                    deepValue(sortingMetric.value, b)
                    return typeof deepValue(sortingMetric.value, b) == 'number'
                    ? deepValue(sortingMetric.value, b) - deepValue(sortingMetric.value, a)
                    : deepValue(sortingMetric.value, b).toString().localeCompare(deepValue(sortingMetric.value, a), undefined, options)
                }
                else {
                    return typeof deepValue(sortingMetric.value, b) == 'number'
                    ? deepValue(sortingMetric.value, a) - deepValue(sortingMetric.value, b)
                    : deepValue(sortingMetric.value, a).toString().localeCompare(deepValue(sortingMetric.value, b), undefined, options)
                }
            })
        }
    }
    return items
})
onBeforeMount(() => {
    provide('pageItemsLength', pageItems.value.length)
})

const navigateTo = (page: number) => {

    updateCurrentPage(page)
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
const refresh = () => {
    navigateTo(currentPage.value)
}
defineExpose({
    refresh,
    selectedItems
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
        :show-toolbar="props.toolbar"
        :external-pagination="props.externalPagination"
        :show-date-picker="props.showDatePicker"
        :show-export="props.showExport"
        :report-title="props.reportTitle"
        :filters="props.filters"
        :loading="props.loading"
        @reset-sort="resetSort"
    >
        <template #actionButton v-if="slots.actionButton">
            <slot name="actionButton" />
        </template>

        <template #table>
            <div
                class="w-full relative"
                :class="[{'overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-400 scrollbar-track-transparent border-y-2 border-t-neutral-200': props.rowHandling == 'scroll' }]"
                :style="{ maxHeight: props.rowHandling == 'scroll' ? ((props.scrollableMaxHeight ?? 500) + 'px') : 'none' }"
            >
                <table
                    :class="[{'select-none': resizing}]"
                    ref="tableRef"
                    v-bind="$attrs"
                    :id="tableUid"
                >
                    <thead ref="thead" :class="[{'sticky -top-[1px] z-10 !border-0': props.rowHandling == 'scroll'}]">
                        <tr>
                            <HeaderElements
                                :resize="props.resize"
                                :selectable="props.selectable"
                                :scrollable="props.rowHandling == 'scroll'"
                                :headers="props.headers"
                                :sort="props.sort"
                            />

                            <HeaderSelectAll v-if="props.selectable"
                                :page-items="pageItems"
                                :class="{'bg-white': props.rowHandling == 'scroll'}"
                            />
                        </tr>
                    </thead>

                    <!-- Non-empty rows -->
                    <RowElements v-if="pageItems.length > 0 && !props.loading"
                        :headers="props.headers"
                        :items="pageItems"
                        :row-classes="props.rowClasses"
                    >
                        <template #rows="{item}">
                            <slot name="rows" :item="item" />
                        </template>
                    </RowElements>

                    <!-- Loading/refreshing placeholder -->
                    <tbody v-else-if="props.loading">
                        <template v-for="index in rowsPerPage">
                            <TableRowSkeleton v-if="index"
                                :cols="props.headers.length + (props.selectable ? 1 : 0)"
                            />
                        </template>
                    </tbody>

                    <!-- Non-loading empty rows -->
                    <tbody v-else>
                        <EmptyItemsRow :colspan="(props.selectable) ? headers.length + 1 : headers.length" />
                    </tbody>
                    
                </table>

            </div>
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
    hidden md:table-header-group

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

/* tr */
table :deep(tbody tr) {
    @apply
    
    /* Mobile */
    flex flex-wrap items-stretch justify-stretch
    w-full max-w-[500px]
    
    /* Desktop */
    md:table-row
    print:table-row
}

/* td */

table :deep(tbody tr td.selectButton),
table :deep(thead tr th.selectButton) {
    @apply

    /* Mobile */
    flex w-full text-sm p-0

    /* Desktop */
    md:table-cell md:w-auto md:py-1 md:pl-2
    print:table-cell print:w-auto print:py-1 print:pl-2

}

table :deep(tbody tr td:not(.selectButton)) {
    @apply
    
    /* Mobile */
    flex flex-col items-stretch
    justify-stretch w-full col-span-full relative

}

table :deep(tbody tr td:not(.selectButton)) {
    @apply relative border-b-[1px] border-b-neutral-300 last:border-b-0 pt-7 pb-2 md:py-2

    /* Desktop */
    md:border-b-0 md:table-cell md:w-auto md:max-w-[150px] lg:max-w-[250px] xl:max-w-[450px]
    print:border-b-0 print:table-cell print:w-auto print:max-w-[450px]
}

table :deep(tr td:not(.selectButton)) {
    @apply

    before:content-[attr(header)] before:absolute before:top-0 before:left-0
    before:whitespace-nowrap before:pl-2 before:pt-2
    before:w-full before:leading-tight before:text-black
    before:font-bold before:text-[13px]

    /* Desktop */
    md:before:hidden
    print:before:hidden
}
.dark table :deep(tr td:not(.selectButton))::before {
    @apply text-neutral-400
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