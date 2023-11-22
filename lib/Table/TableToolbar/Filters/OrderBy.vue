<script setup lang="ts">
import Select from '../../../Inputs/Select.vue'
import InputGroup from '../../../Inputs/InputGroup.vue'
import { ref, inject, computed, onBeforeMount } from 'vue'

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
        dir: dirEntries.value.find(entry => entry.active)?.value
    }
})

onBeforeMount(() => {

    // Add a top "None" item if one was not provided
    if (!entries.value.some(val => val.value == 'none')) {
        entries.value.unshift({
            title: 'None',
            value: 'none',
            classes: 'mb-2 border-y-2 border-neutral-300'
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
    <InputGroup>
        <template #input>
            <div class="flex items-center justify-between gap-5">
                <Select
                    button-classes="pb-1 pt-5 min-w-[175px]"
                    :items="entries"
                    :model-value="entries.find(e => e.active)?.value"
                    @update:model-value="val => entrySelected(val)"
                    searchable
                    ref="orderByRef"
                />
                <Select
                    button-classes="pb-1 pt-5 min-w-[175px]"
                    empty-placeholder="Direction"
                    :items="dirEntries"
                    @update:model-value="val => dirSelected(val)"
                    :class="[{'disabled': entries.some(entry => entry.active && entry.value == 'none')}]"
                    ref="dirRef"
                    v-model="defaultDir"
                />
            </div>
        </template>
        <template #label>
            <label class="!-translate-y-8 capitalize">Order By</label>
        </template>
    </InputGroup>
</template>
<style scoped>
.disabled {
    @apply relative
}

.disabled:after {
    @apply absolute content-[''] top-0 left-0 h-full w-full transition-all bg-white opacity-50 hover:cursor-not-allowed
}
</style>