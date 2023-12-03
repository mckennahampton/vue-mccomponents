<script setup lang="ts">
import VR from '../../Layout/VR.vue'
import { inject, type ComputedRef, computed } from 'vue'
import { timestampToISO } from '../../Utilities/dateHelpers'
import { type LaravelFormattedFilter, type LaravelFormattedOrderBy } from '../Table.vue'

const startDate = inject('startDate') as ComputedRef<Date>
const endDate = inject('endDate') as ComputedRef<Date>
const laravelFormattedFilters = inject('laravelFormattedFilters') as ComputedRef<LaravelFormattedFilter[]>
const laravelFormattedOrderBy = inject('laravelFormattedOrderBy') as ComputedRef<LaravelFormattedOrderBy>
const totalItemsLength = inject('totalItemsLength') as ComputedRef<number>
const externalPagination = inject('externalPagination') as ComputedRef<boolean>
const loading = inject('loading') as boolean

const orderByTitle = computed(() => laravelFormattedOrderBy.value.title ?? laravelFormattedOrderBy.value.metric )
const orderByDir = computed(() => laravelFormattedOrderBy.value.dir == 'asc' ? 'Ascending' : 'Descending')

</script>
<template>

    <div v-if="!loading" class="flex items-center justify-start gap-5 italic text-neutral-600">

        <!-- Item total count -->
        <span><span class="_label">Total:</span> {{ totalItemsLength }}</span>

        <!-- Start & End dates -->
        <template v-if="(startDate || endDate) && externalPagination">
            <VR inner-classes="!mx-0"/>
            <span v-if="startDate">
                <span class="_label">From:</span> {{ timestampToISO(startDate) }}
                <span v-if="endDate" class="_label">-</span> {{ timestampToISO(endDate) }}
            </span>
        </template>

        <!-- Order By -->
        <template v-if="laravelFormattedOrderBy.metric && externalPagination">
            <VR inner-classes="!mx-0"/>
            <span>
                <span class="_label">Ordered By:</span> <span class="capitalize">{{ orderByTitle }}</span>, <span>{{ orderByDir }}</span>
            </span>
        </template>

        <!-- Filter count -->
        <template v-if="laravelFormattedFilters.length > 0">
            <VR inner-classes="!mx-0"/>
            <span>
                <span class="_label">Active Filters:</span> {{ laravelFormattedFilters.length }}
            </span>
        </template>

    </div>

    <div v-else class="w-full divide-y divide-gray-200 animate-pulse">
        <div class="flex items-center justify-between">
            <div>
                <div class="h-2.5 bg-gray-300  w-24 mb-2.5"></div>
            </div>
        </div>
    </div>

</template>
<style scoped>
    ._label { @apply text-neutral-400 }
</style>