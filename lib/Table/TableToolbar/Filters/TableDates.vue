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
        <template #input>
            <DatePicker
                v-model="startDate"
                :max-date="endDate"
            />
        </template>
        <template #label>
            <label>Start Date</label>
        </template>
    </InputGroup>

    <InputGroup>
        <template #input>
            <DatePicker
                v-model="endDate"
                :max-date="props.maxDate ? new Date(props.maxDate) : new Date()"
                :min-date="startDate"
            />
        </template>
        <template #label>
            <label>End Date</label>
        </template>
    </InputGroup>

</template>