<script setup lang="ts">
import { inject, type ComputedRef } from 'vue'
import { type InternalColumn } from '../Table.vue'
import TransitionFade from '../../Transitions/TransitionFade.vue'
import FasArrowUpWideShort from '../../Icons/FasArrowUpWideShort.vue'
import FasArrowDownShortWide from '../../Icons/FasArrowDownShortWide.vue'

interface Props {
    column: InternalColumn,
    dark: boolean,
}
const props = defineProps<Props>()

const sortAsc = inject('sortAsc') as ComputedRef
const sorting = inject('sorting') as ComputedRef
const sortingMetric = inject('sortingMetric') as ComputedRef
const toggleSortDir = inject('toggleSortDir') as Function
const updateSorting = inject('updateSorting') as Function
const udpateSortingMetric = inject('updateSortingMetric') as Function

const sort = (metric: string) => {
    if (props.column.sort) {
        udpateSortingMetric(metric)
        updateSorting(true)
        toggleSortDir()
    }
}

</script>
<template>
    <!-- Header caption -->
    <span class="select-none relative">
        {{ props.column.caption }}

        <TransitionFade>
            <span v-if="sorting && sortingMetric == props.column.key"
                class="absolute top-[50%] transform -translate-y-[50%] -right-[20px]"
            >
                <FasArrowDownShortWide v-if="sortAsc"
                    :class="[dark ? 'fill-neutral-400' : 'fill-neutral-500']"
                />
                <FasArrowUpWideShort v-else
                    :class="[dark ? 'fill-neutral-400' : 'fill-neutral-500']"
                />
            </span>
        </TransitionFade>
    </span>

    <span
        class="absolute w-full h-full top-0 left-0"
        @click="sort(props.column.key)"
    ></span>
</template>