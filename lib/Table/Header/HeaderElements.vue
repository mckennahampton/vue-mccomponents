<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import HeaderResizer from './HeaderResizer.vue'
import { type InternalColumn } from '../Table.vue'
import { ref, onMounted, inject, type ComputedRef } from 'vue'
import TransitionFade from '../../Transitions/TransitionFade.vue'
import FasArrowUpWideShort from '../../Icons/FasArrowUpWideShort.vue'
import FasArrowDownShortWide from '../../Icons/FasArrowDownShortWide.vue'

interface Props {
    resize: boolean,
    selectable: boolean,
    classes?: string | object | any[]
    scrollable: boolean,
    column: InternalColumn,
    sort: boolean,
    index: number,
    itemCount: number,
    rowsPerPage: number,
    dark: boolean,
    isLast: boolean
}
const props = defineProps<Props>()

const updateInnerColumnThSize = inject('updateInnerColumnThSize') as Function
const toggleSortDir = inject('toggleSortDir') as Function
const updateSorting = inject('updateSorting') as Function
const udpateSortingMetric = inject('updateSortingMetric') as Function
const sortAsc = inject('sortAsc') as ComputedRef
const sorting = inject('sorting') as ComputedRef
const sortingMetric = inject('sortingMetric') as ComputedRef

const thRef = ref(null)
const { width } = useElementSize(thRef)
onMounted(() => updateInnerColumnThSize(props.column.uid, width.value))

const sort = (metric: string) => {
    if (props.sort && props.column.key && props.column.sort) {
        udpateSortingMetric(metric)
        updateSorting(true)
        toggleSortDir()
    }
}

</script>
<template>
    <th v-if="column.caption != 'table_select'"
        @click="sort(props.column.key)"
        :class="[
            column.classes,
            {'hover:cursor-pointer': props.sort && column.key},
            {'resizeable relative': props.resize},
            {'bg-white': props.scrollable && !props.dark},
            {'pr-6': props.resize}
        ]"
        ref="thRef"
        class="whitespace-nowrap pl-2 py-1"
        :data-width="props.column.width"
        :data-th="props.column.uid"
        :style="{
            ...(props.column.width > 0) && {
                width: props.column.width + 'px'
            }
        }"
    >
            <!-- Header caption -->
            <span class="select-none relative">

                <!-- UI Caption / Slot -->
                <slot v-if="props.column.headerHasSlotContent" :name="props.column.headerSlotName" />
                <template v-else>
                    {{ props.column.caption }}
                </template>

                <!-- Sorting Icon -->
                <TransitionFade>
                    <span v-if="sorting && sortingMetric == props.column.key"
                        class="absolute top-[50%] transform -translate-y-[50%] -right-[20px]"
                    >
                        <FasArrowDownShortWide v-if="sortAsc":class="[dark ? 'fill-neutral-400' : 'fill-neutral-500']" />
                        <FasArrowUpWideShort v-else :class="[dark ? 'fill-neutral-400' : 'fill-neutral-500']" />
                    </span>
                </TransitionFade>
            </span>

            <!-- Resizing -->
            <HeaderResizer v-if="props.resize && !props.isLast"
                :index="props.index"
                :column="props.column"
            />

        
    </th>
</template>
<style scoped>
.resizable:not(:last-child):after {
    @apply content-[''] absolute block w-[2px] h-full bg-neutral-300 right-0 top-0
}
</style>
