<script setup lang="ts">
import VR from '../../Layout/VR.vue'
import ExportCsv from './ExportCsv.vue'
import ExportPdf from './ExportPdf.vue'
import PrintTable from './PrintTable.vue'
import Input from '../../Inputs/Input.vue'
import RowsPerPage from './RowsPerPage.vue'
import QueryDetails from './QueryDetails.vue'
import FasBars from '../../Icons/FasBars.vue'
import TableDates from './Filters/TableDates.vue'
import FasFilter from '../../Icons/FasFilter.vue'
import PaginateButtons from '../PaginateButtons.vue'
import Accordion from '../../Accordion/Accordion.vue'
import MutedButton from '../../Buttons/MutedButton.vue'
import FasCaretDown from '../../Icons/FasCaretDown.vue'
import DropdownButton from '../../Buttons/DropdownButton.vue'
import AccordionItem from '../../Accordion/AccordionItem.vue'
import { type ExportConfig, InternalColumn } from '../TableTypes'
import TransitionFade from '../../Transitions/TransitionFade.vue'
import OrderBy, { type OrderByEntry } from './Filters/OrderBy.vue'
import TableFilters, { type Filter} from './Filters/TableFilters.vue'
import { ref, useSlots, inject, onMounted, type ComputedRef } from 'vue'
import { type LengthAwarePaginator } from '../../Types/Laravel/LengthAwarePaginator'

interface Props {
    toolbar: boolean,
    showDatePicker: boolean,
    filters?: Filter[],
    externalPagination: false | LengthAwarePaginator,
    showExport: boolean,
    exportConfig?: ExportConfig,
    loading: boolean,
    paginate: boolean,
    items: any[],
    columns: InternalColumn[],
    toolbarClasses?: any,
    dark: boolean,
}
const props = defineProps<Props>()

const emit = defineEmits([
    'resetSort',
    'deselectAll',
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

const hasExportButton = (type: 'csv' | 'pdf' | 'print' | 'reportTitle') => {
    return props.hasOwnProperty('exportConfig') && typeof props.exportConfig !== 'undefined'
    ? props.exportConfig.hasOwnProperty(type) && props.exportConfig[type]
    : true
}

</script>
<template>
    <div class="flex flex-col items-start justify-center w-full mb-20 relative" :class="props.toolbarClasses">
        <template v-if="props.toolbar">
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
                            <div class="flex w-full lg:max-w-none items-center justify-between lg:justify-start lg:gap-5 mb-5 lg:mb-0">
                                
                                <!-- Quick Filter -->
                                <Input
                                    :render-label="false"
                                    placeholder="Filter Visible Rows..."
                                    v-model="textFilter"
                                    class="max-md:w-[200px] md:w-auto !border-x-0 !border-t-0 !outline-none !shadow-[none]"
                                    :class="[
                                        dark ? 'text-white' : 'text-black'
                                    ]"
                                />

                                <!-- Reset Filter -->
                                <MutedButton v-if="filtered"
                                    @click="resetFilter"
                                    class="italic whitespace-nowrap text-cyan-500"
                                >
                                    Reset
                                </MutedButton>

                                <VR class="max-lg:hidden" />

                                <!-- Desktop menu buttons -->

                                <!-- Rows per page button -->
                                <RowsPerPage
                                    class="max-lg:hidden"
                                    :dark="dark"
                                    :external-pagination="props.externalPagination"
                                    v-model:rows-per-page="rowsPerPage"
                                />

                                <!-- Export buttons -->
                                <template v-if="props.showExport">
                                    <VR class="max-lg:hidden" />
                                    <ExportCsv v-if="hasExportButton('csv')"
                                        class="max-lg:hidden"
                                        :dark="dark"
                                        :items="props.items"
                                        :report-title="props?.exportConfig?.reportTitle"
                                        :columns="props.columns"
                                    />
                                    <ExportPdf v-if="hasExportButton('pdf')"
                                        class="max-lg:hidden"
                                        :dark="dark"
                                        :report-title="props?.exportConfig?.reportTitle"
                                    />
                                    <PrintTable v-if="hasExportButton('print')"
                                        class="max-lg:hidden"
                                        :dark="dark"
                                    />
                                </template>

                                <!-- /Desktop menu buttons -->

                                <!-- Filter bar toggle -->
                                <template v-if="props.showDatePicker || props.filters">
                                    <VR class="max-lg:hidden" />
                                    <div class="flex items-center justify-center gap-3">

                                        <!-- Mobile menu buttons-->
                                        <DropdownButton :dark="props.dark" class="lg:hidden justify-self-end">
                                            <template #button>
                                                <FasBars :class="[props.dark ? 'fill-white' : 'fill-black']" />
                                            </template>
                                            <template #dropdown>
                                                <!-- Rows per page button -->
                                                <RowsPerPage
                                                    :dark="dark"
                                                    :external-pagination="props.externalPagination"
                                                    v-model:rows-per-page="rowsPerPage"
                                                />

                                                <!-- Export buttons -->
                                                <template v-if="props.showExport">
                                                    <VR />
                                                    <ExportCsv
                                                        class="max-lg:hidden"
                                                        :dark="dark"
                                                        :items="props.items"
                                                        :report-title="props?.exportConfig?.reportTitle"
                                                        :columns="props.columns"
                                                    />
                                                    <ExportPdf class="max-lg:hidden" :dark="dark" :report-title="props?.exportConfig?.reportTitle" />
                                                    <PrintTable class="max-lg:hidden" :dark="dark" />
                                                </template>
                                            </template>
                                        </DropdownButton>

                                        <!-- Filters button -->
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
                                    </div>
                                </template>
                            </div>

                        </template>

                        <!-- Filter toolbar -->
                        <template #panel v-if="props.showDatePicker || props.filters">
                            <div
                                class="flex flex-col md:flex-row gap-3 items-center justify-between w-full py-5 px-8 border-l-2 mt-3 shadow-inner"
                                :class="[
                                    dark ? 'border-neutral-800 shadow-neutral-900' : 'border-neutral-400 shadow-neutral-200',
                                ]">
                                <div class="flex flex-col lg:flex-row flex-wrap gap-10 items-center justify-start">
                                    <span class="flex flex-col lg:flex-row items-center justify-between gap-16 md:gap-8">
                                        <span class="flex items-center justify-center gap-5 flex-col md:flex-row">
                                            <TableDates v-if="props.showDatePicker"
                                                :dark="dark"
                                                ref="tableDatesRef"
                                            />
                                        </span>

                                        <template v-if="orderByEntries">
                                            <VR class="max-lg:hidden" />
                                            <OrderBy ref="orderByRef" :dark="dark" />
                                        </template>
                                    </span>
                                    <template v-if="props.filters">
                                        <span class="flex flex-col gap-5">
                                            <span class="md:hidden w-full text-start font-bold" :class="[props.dark ? 'text-white' : 'text-black']">Filters</span>
                                            <span class="w-full flex flex-col md:flex-row flex-wrap items-center justify-start gap-8">
                                                <TableFilters
                                                    :filters="props.filters"
                                                    :dark="dark"
                                                    ref="tableFiltersRef"
                                                />
                                            </span>
                                        </span>

                                    </template>

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

        <div v-if="slots.footer"
            class="w-full border-y-2"
            :class="[
                {'border-y-neutral-200': !props.dark},
                {'border-y-neutral-800': props.dark}
            ]"
        >
            <slot name="footer" :items="items" />
        </div>

        <div class="w-full flex items-center justify-between gap-5">
            <QueryDetails :dark="props.dark" />

            <!-- Non-fixed layout paginate buttons -->
            <PaginateButtons v-if="props.paginate"
                class="self-end"
                :loading="props.loading"
                :dark="props.dark"
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