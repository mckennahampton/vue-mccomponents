<script setup lang="ts">
import { inject, type ComputedRef } from 'vue'
import DatePicker from '../../../Inputs/DatePicker.vue'

interface Props {
    maxDate?: string,
    startDateDefault?: string,
    dark: boolean
}
const props = defineProps<Props>()

const dirtyStartDate = inject('dirtyStartDate') as ComputedRef
const dirtyEndDate = inject('dirtyEndDate') as ComputedRef
const updateStartDate = inject('updateStartDate') as Function
const updateEndDate = inject('updateEndDate') as Function

const resetDates = () => {
    updateEndDate(new Date)
    updateStartDate((new Date).setMonth((new Date).getMonth() - 1))
}

defineExpose({
    resetDates,
})

</script>
<template>
    <DatePicker
        v-model="dirtyStartDate"
        :max-date="dirtyEndDate"
        :dark="props.dark"
    >
        <template #label>Start Date</template>
    </DatePicker>

    <DatePicker
        v-model="dirtyEndDate"
        :max-date="props.maxDate ? new Date(props.maxDate) : new Date()"
        :min-date="dirtyStartDate"
        :dark="props.dark"
    >
        <template #label>End Date</template>
    </DatePicker>
</template>