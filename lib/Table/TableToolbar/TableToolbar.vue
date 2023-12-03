<script setup lang="ts">
import VR from '../../Layout/VR.vue'
import Input from '../../Inputs/Input.vue'
import Accordion from '../../Accordion/Accordion.vue'
import MutedButton from '../../Buttons/MutedButton.vue'
import OrderBy, { type OrderByEntry } from './Filters/OrderBy.vue'
import AccordionItem from '../../Accordion/AccordionItem.vue'
import PaginateButtons from '../PaginateButtons.vue'
import ExportCsv from './ExportCsv.vue'
import ExportPdf from './ExportPdf.vue'
import { ref, useSlots, inject, onMounted, type ComputedRef, watch } from 'vue'
import PrintTable from './PrintTable.vue'
import TransitionFade from '../../Transitions/TransitionFade.vue'
import RowsPerPage from './RowsPerPage.vue'
import TableDates from './Filters/TableDates.vue'
import { type LengthAwarePaginator } from '../../Types/Laravel/LengthAwarePaginator'
import TableFilters, { type Filter} from './Filters/TableFilters.vue'
import FasFilter from '../../Icons/FasFilter.vue'
import FasCaretDown from '../../Icons/FasCaretDown.vue'
import QueryDetails from './QueryDetails.vue'

interface Props {
    showToolbar: boolean,
    showDatePicker: boolean,
    filters?: Filter[],
    externalPagination: false | LengthAwarePaginator,
    showExport: boolean,
    reportTitle?: string,
    loading: boolean,
    paginate: boolean,
}
const props = defineProps<Props>()

const emit = defineEmits([
    'resetSort',
    'navigateTo',
    'update:filtered',
    'update:rowsPerPage',
])

const slots = useSlots()

const navigateTo = inject('navigateTo') as Function
const filtered = inject('filtered') as Boolean
const updateQuickFilter = inject('updateQuickFilter') as Function
const rowsPerPage = inject('rowsPerPage') as ComputedRef
const orderByEntries = inject('orderByEntries') as OrderByEntry[]
const dark = inject('dark') as boolean

const deselectAll = inject('deselectAll') as Function

const textFilter = ref('')

const tableDatesRef = ref(null)
const orderByRef = ref(null)
const tableFiltersRef = ref(null)

const filter = () => {
    if(textFilter.value) {
        updateQuickFilter(textFilter.value)
        emit('resetSort')
    }
    else {
        textFilter.value = ''
        updateQuickFilter(textFilter.value)
    }
    deselectAll()
}
watch(textFilter, () => {
    filter()
})

const resetFilter = () => {
    textFilter.value = ''
    updateQuickFilter(textFilter.value)
    filter()
}

const resetFilters = () => {
    //@ts-ignore
    tableDatesRef.value?.resetDates()
    //@ts-ignore
    tableFiltersRef.value?.resetFilters()
    //@ts-ignore
    orderByRef.value?.resetOrderBy()
}

const paginateCon = ref(null)
const paginateHeight = ref('')
onMounted(() => {
    if(props.paginate) {
        //@ts-ignore
        paginateHeight.value = paginateCon.value.offsetHeight + 'px'
    }
})

</script>
<template>
    <div class="flex flex-col items-start justify-center w-full mb-20 relative">
        <template v-if="props.showToolbar">
            <div 
                :class="[{'disabled': props.loading}]"
                class="relative flex justify-between items-center bottom-0 left-0 w-full select-none py-3 print:hidden"
                ref="paginateCon"
            >
                <Accordion class="w-full">
                    <AccordionItem
                        button-toggle-only
                        :show-icon="false"
                        item-classes="!justify-center md:!justify-start gap-2"
                        :panel-classes="{'!z-[0]': props.loading}"
                    >
                        <template #header="{toggle, isOpen}">

                            <!-- Row Options Selector -->
                            <div class="flex w-full max-w-[500px] md:max-w-none items-center justify-between md:justify-start gap-5 mb-5 md:mb-0">
                                <!-- Quick Filter -->
                                <Input placeholder="Filter Visible Rows..." v-model="textFilter" class="w-[200px] md:w-auto" />
                                <MutedButton v-if="filtered"
                                    @click="resetFilter"
                                    class="italic whitespace-nowrap text-cyan-500"
                                >
                                    Reset
                                </MutedButton>

                                <VR />

                                <!-- Rows per page button -->
                                <RowsPerPage
                                    :external-pagination="props.externalPagination"
                                    v-model:rows-per-page="rowsPerPage"
                                />

                                <!-- Export buttons -->
                                <template v-if="props.showExport">
                                    <VR />
                                    <ExportCsv :report-title="props.reportTitle" />
                                    <ExportPdf :report-title="props.reportTitle" />
                                    <PrintTable />
                                </template>

                                <!-- Filter bar toggle -->
                                <template v-if="props.showDatePicker || props.filters">
                                    <VR />
                                    <span
                                        class="flex items-center justify-center gap-2 hover:cursor-pointer py-1 px-2"
                                        :class="[
                                            {'bg-neutral-800': isOpen && dark},
                                            {'bg-neutral-100': isOpen && !dark},
                                            dark ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'
                                        ]"
                                        @click="toggle"
                                    >
                                        <FasFilter :class="[dark ? 'fill-neutral-100' : 'fill-black']" />
                                        Filters
                                        <FasCaretDown
                                            :class="[
                                                {'rotate-180': isOpen},
                                                dark ? 'fill-neutral-100' : 'fill-black'
                                            ]"
                                            class="fa-fw transition-all hover:cursor-pointer"
                                            @click="toggle"
                                        />
                                    </span>
                                </template>
                            </div>

                        </template>

                        <!-- Filter toolbar -->
                        <template #panel v-if="props.showDatePicker || props.filters">
                            <div
                                class="flex gap-3 items-center justify-between w-full py-5 px-8 border-l-2 mt-3 shadow-inner"
                                :class="[
                                    dark ? 'border-neutral-800 shadow-neutral-900' : 'border-neutral-400 shadow-neutral-200',
                                ]">
                                <div class="flex flex-wrap gap-10 items-center justify-start">
                                    <span class="flex items-center justify-between gap-8">
                                        <TableDates v-if="props.showDatePicker"
                                            :dark="dark"
                                            ref="tableDatesRef"
                                        />
                                        <template v-if="orderByEntries">
                                            <VR />
                                            <OrderBy ref="orderByRef" :dark="dark" />
                                        </template>
                                    </span>
                                    <span v-if="props.filters" class="w-full flex flex-wrap items-center justify-start gap-8">
                                        <TableFilters
                                            :filters="props.filters"
                                            :dark="dark"
                                            ref="tableFiltersRef"
                                        />
                                    </span>

                                </div>

                                <div class="flex flex-col h-full gap-3 items-center justify-center">
                                    <MutedButton
                                        @click="props.loading ? null : navigateTo(1)"
                                        class="font-bold"
                                        :class="[
                                            {'disabled': props.loading },
                                            dark ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-neutral-200'
                                        ]"
                                    >
                                        Apply
                                    </MutedButton>
                                    <span @click="resetFilters" class="text-cyan-500 italic hover:cursor-pointer">Reset Filters</span>
                                </div>

                            </div>
                        </template>
                    </AccordionItem>
                </Accordion>

                <!-- Higher-level additional action button from table -->
                <div v-if="slots.actionButton" class="flex items-center justify-end w-full">
                    <slot name="actionButton" />
                </div>

                <!-- Loading overlay -->
                <TransitionFade>
                    <div v-show="props.loading" class="absolute w-full h-full left-0 top-0 z-[4] bg-white bg-opacity-20 transition-all">
                        <div class="absolute top-[50%] left-[50%] transform -translate-x-[50%] -translate-y-[50%] flex items-center justify-center gap-5 p-4 border-2 border-black bg-white transition-all">
                            <span class="font-bold">Loading...</span>
                            <span class="w-[20px] h-[20px] animate-spin-fast inline-block border-2 border-black border-opacity-50 border-t-white rounded-[100%] border-solid"></span>
                        </div>
                    </div>
                </TransitionFade>

            </div>
        </template>

        <slot name="table" />

        <div class="w-full flex items-center justify-between gap-5">
            <QueryDetails />

            <!-- Non-fixed layout paginate buttons -->
            <PaginateButtons v-if="props.paginate"
                class="self-end"
                :loading="props.loading"
            />
        </div>

    </div>

</template>
<style scoped>
.disabled {
    @apply relative
}

.disabled:after {
    @apply absolute content-[''] top-0 left-0 h-full w-full transition-all bg-white opacity-50 hover:cursor-not-allowed
}
</style>