<script setup lang="ts">
import { ref, watch } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'

interface Props {
    modelValue: Date,
    enableTime?: boolean,
    maxDate?: Date,
    minDate?: Date,
    clearable?: boolean,
    classes?: string | object | any[]
}
const props = withDefaults(defineProps<Props>(), {
    clearable: false,
    enableTime: false,
})
const emit = defineEmits(['update:modelValue'])

const dateModel = ref(props.modelValue)

watch(dateModel, () => {
    emit('update:modelValue', dateModel.value)
})
watch(props, () => {
    dateModel.value = props.modelValue
})

</script>
<template>
    <VueDatePicker
        v-model="dateModel"
        class="max-w-[150px] rounded-none"
        :class="props.classes"
        auto-apply
        :clearable="props.clearable"
        :enable-time-picker="props.enableTime"
        :max-date="props.maxDate"
        :min-date="props.minDate"
    />
</template>
<style scoped>
:deep(.dp__input) {
    @apply rounded-none border-x-0 border-t-0 min-w-[150px] w-full h-10 text-gray-900 border-b-2 border-neutral-400 focus:outline-none focus:border-neutral-500
}

:deep(.dp__menu) {
    @apply rounded-none
}

:deep(.dp__cell_inner),
:deep(.dp__month_year_wrap button),
:deep(.dp__overlay_cell)
{
    @apply rounded-none
}

:deep(.dp__active_date),
:deep(.dp__overlay_cell_active)
{
    @apply rounded-none bg-neutral-500
}

:deep(.dp__month_year_wrap button)
{
    @apply rounded-none
}

:deep(.dp__today)
{
    @apply border-neutral-500 border-2
}
</style>