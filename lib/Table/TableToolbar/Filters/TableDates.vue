<script setup lang="ts">
import { inject, type ComputedRef } from 'vue'
import DatePicker from '../../../Inputs/DatePicker.vue'
import InputGroup from '../../../Inputs/InputGroup.vue'

interface Props {
    maxDate?: string,
    startDateDefault?: string,
}
const props = defineProps<Props>()

const startDate = inject('startDate') as ComputedRef
const endDate = inject('endDate') as ComputedRef
const updateStartDate = inject('updateStartDate') as Function
const updateEndDate = inject('updateEndDate') as Function
const dark = inject('dark') as ComputedRef

const resetDates = () => {
    updateEndDate(new Date)
    updateStartDate((new Date).setMonth((new Date).getMonth() - 1))
}

defineExpose({
    resetDates,
})

</script>
<template>
    <InputGroup>
        <DatePicker
            v-model="startDate"
            :max-date="endDate"
            label="Start Date"
            :dark="dark"
        />
    </InputGroup>

    <InputGroup>
        <DatePicker
            v-model="endDate"
            :max-date="props.maxDate ? new Date(props.maxDate) : new Date()"
            :min-date="startDate"
            label="End Date"
            :dark="dark"
        />
    </InputGroup>

</template>