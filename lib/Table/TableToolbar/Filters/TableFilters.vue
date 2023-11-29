<script setup lang="ts">
import Select from '../../../Inputs/Select.vue'
import InputGroup from '../../../Inputs/InputGroup.vue'
import { ref, computed, inject, onBeforeMount } from 'vue'

interface FilterValue {
    value: string | number | boolean | null,
    title?: string,
    active?: boolean,
    classes?: any | any[]
}

export interface Filter {
    metric: string,
    values: FilterValue[],
    current?: string | null,
    searchable?: boolean,
    label?: string,
}

interface Props {
    filters: Filter[]
}
const props = defineProps<Props>()

const filters = ref(props.filters)
const filterRefs = ref([])

onBeforeMount(() => {
    filters.value?.forEach(filter => {

        // Add a top "All" item if any of them don't have one
        if (!filter.values.some(val => val.value == 'all')) {
            filter.values.unshift({
                title: 'All',
                value: 'all',
                classes: 'mb-2 border-y-2 border-neutral-300',
            })
        }

        // Check if any filter values have a pre-configured "active" value
        // If there is not, then activate the first one by default
        if (!filter.values.some(val => val.hasOwnProperty('active'))) {
            filter.values[0].active = true
        }

        // Now backfill the rest as non-active
        filter.values.filter(val => !val.hasOwnProperty('active')).forEach(val => {
            val['active'] = false
        })

    })
})

const filterSelected = (metric: string, value: string) => {
    
    // Set all values to false except the target
    filters.value
    ?.find(filter => filter.metric == metric)
    ?.values.forEach(filterValue => {
        filterValue.value == value
        ? filterValue.active = true
        : filterValue.active = false
    })

    updateLaravelFormattedFilters(laravelFormattedFilters.value)
}

const resetFilters = () => {

    // Reset the local filter values
    filters.value?.forEach(fitler => {
        fitler.values.forEach(filterValue => {
            filterValue.value == 'all'
            ? filterValue.active = true
            : filterValue.active = false
        })
    })

    // Reset the Select components (for UI)
    //@ts-ignore
    filterRefs.value?.forEach(selectComp => selectComp.reset())
    updateLaravelFormattedFilters(laravelFormattedFilters.value)
}

const updateLaravelFormattedFilters = inject('updateLaravelFormattedFilters') as Function
const laravelFormattedFilters = computed(() => {
    /**
     * Returns an array of all filters with selected (and non-"all") value
     * 
     * Structure:
     * [
     *    { metric: string = dbColumnName, value: string = filterValue },
     *    { metric: string = dbColumnName, value: string = filterValue },
     * ]
     */

    let results = filters.value?.some(filter =>filter.values.some(filterValue => filterValue.active && filterValue.value !== 'all'))
    ? filters.value
        .filter(filter => filter.values.some(filterValue => filterValue.active && filterValue.value !== 'all'))
        .map(filter => ({
            metric: filter.metric,
            value: filter.values.find(filterValue => filterValue.active)?.value
        }))
    : false
    return results
})

defineExpose({
    resetFilters,
    filters
})

</script>
<template>
    <template v-for="filter in filters">

        <!-- <VR /> -->
        <InputGroup class="max-w-1/2 md:max-w-1/3 lg:max-w-1/4">
            <template #input>
                <!-- @vue-ignore-->
                <Select
                    button-classes="pb-1 pt-5 min-w-[175px]"
                    :items="filter.values"
                    :model-value="filter.values.find(val => val.active)?.value?.toString()"
                    @update:model-value="val => filterSelected(filter.metric, val)"
                    :searchable="filter.searchable"
                    ref="filterRefs"
                />
            </template>
            <template #label>
                <label class="!-translate-y-8 capitalize">{{ filter.label ?? filter.metric }}</label>
            </template>
        </InputGroup>

    </template>
</template>