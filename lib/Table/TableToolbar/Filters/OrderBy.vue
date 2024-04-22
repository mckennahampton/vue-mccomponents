<script setup lang="ts">
import Select from '../../../Inputs/Select.vue'
import { ref, inject, computed, onBeforeMount } from 'vue'

const props = defineProps<{
    dark: boolean,
}>()

export interface OrderByEntry {
    value: string,
    title?: string,
    active?: boolean,
    classes?: any | any[]
}

const orderByEntries = inject('orderByEntries') as OrderByEntry[]
const updateLaravelFormattedOrderBy = inject('updateLaravelFormattedOrderBy') as Function
const entries = ref(orderByEntries)

const dirEntries = ref([
    { value: 'asc', title: 'Ascending', active: true },
    { value: 'desc', title: 'Descending', active: false }
])
const defaultDir = ref('asc')

const formattedOrderBy = computed(() => {
    return entries.value.find(entry => entry.active)?.value == 'none'
    ? null
    :
    {
        metric: entries.value.find(entry => entry.active)?.value,
        dir: dirEntries.value.find(entry => entry.active)?.value,
        ... entries.value.find(entry => entry.active)?.title && {
            title: entries.value.find(entry => entry.active)?.title 
        }
    }
})

onBeforeMount(() => {

    // Add a top "None" item if one was not provided
    if (!entries.value.some(val => val.value == 'none')) {
        entries.value.unshift({
            title: 'None',
            value: 'none',
            classes: `mb-2 border-y-2 ${props.dark ? 'border-neutral-700' : 'border-neutral-300'}`
        })
    }

    // Check if any filter values have a pre-configured "active" value
    // If there is not, then activate the first one by default
    if (!entries.value.some(val => val.hasOwnProperty('active'))) {
        entries.value[0].active = true
    }

    // Now backfill the rest as non-active
    entries.value.filter(val => !val.hasOwnProperty('active')).forEach(val => {
        val['active'] = false
    })

})

const entrySelected = (value: string) => {
    let temp = value ?? 'none' // Default to none

    // Set all values to false except for the target
    entries.value.forEach(entry => {
        entry.value == temp
        ? entry.active = true
        : entry.active = false
    })

    updateLaravelFormattedOrderBy(formattedOrderBy.value)
}

const dirSelected = (value: string) => {
    let temp = value ?? 'asc'

    // Set all values to false except for the target
    dirEntries.value.forEach(entry => {
        entry.value == temp
        ? entry.active = true
        : entry.active = false
    })

    updateLaravelFormattedOrderBy(formattedOrderBy.value)
}

const orderByRef = ref(null)
const dirRef = ref(null)

const resetOrderBy = () => {

    // Check if any filter values have a pre-configured "active" value
    // If there is not, then activate the first one by default
    if (!orderByEntries.some(val => val.hasOwnProperty('active'))) {
        let temp = orderByEntries.find(val => val.hasOwnProperty('active'))
        entries.value.forEach(entry => {
            if (temp && entry.value == temp.value) entry.active = true
        })
    }
    else {
        entries.value[0]['active'] = true
    }

    // Now backfill the rest as non-active
    entries.value.filter(val => !val.hasOwnProperty('active')).forEach(val => {
        val['active'] = false
    })

    //@ts-ignore
    orderByRef.value?.reset()
    //@ts-ignore
    dirRef.value?.reset()
}

defineExpose({
    resetOrderBy
})

</script>
<template>
    <div class="flex flex-col md:flex-row max-md:mt-4 max-md:mb-5 items-center justify-between md:gap-5">
        <Select
            button-classes="pb-1 pt-5 min-w-[175px]"
            :items="entries"
            :model-value="entries.find(e => e.active)?.value"
            @update:model-value="val => entrySelected(val)"
            searchable
            ref="orderByRef"
            label="Order By"
            :dark="props.dark"
        />
        <Select
            button-classes="pb-1 pt-5 min-w-[175px]"
            empty-placeholder="Direction"
            :items="dirEntries"
            @update:model-value="val => dirSelected(val)"
            :class="[
                {'disabled': entries.some(entry => entry.active && entry.value == 'none')},
                {'disabled-dark': entries.some(entry => entry.active && entry.value == 'none') && props.dark}
            ]"
            ref="dirRef"
            v-model="defaultDir"
            :dark="props.dark"
        />
    </div>
</template>