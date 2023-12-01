<script setup lang="ts">
import { ref, watch } from 'vue'
import uid from '../Utilities/uid'
import '@vuepic/vue-datepicker/dist/main.css'
import VueDatePicker from '@vuepic/vue-datepicker'

interface Props {
    modelValue: Date,
    enableTime?: boolean,
    maxDate?: Date,
    minDate?: Date,
    clearable?: boolean,
    classes?: string | object | any[],
    label?: string,
    labelStyle?: string | object | any[],
    dark?: boolean,
}
const props = withDefaults(defineProps<Props>(), {
    clearable: false,
    enableTime: false,
    dark: false,
})
const emit = defineEmits(['update:modelValue'])

const dateModel = ref(props.modelValue)
const inputUid = uid()

watch(dateModel, () => {
    emit('update:modelValue', dateModel.value)
})
watch(props, () => {
    dateModel.value = props.modelValue
})

</script>
<template>
    <label v-if="props.label"
        class="absolute left-0 -top-5 text-sm transition-all transform -translate-x-1 text-black dark:text-white delay-0"
        :for="inputUid"
    >
        {{ props.label }}
    </label>
    <VueDatePicker
        v-bind="$attrs"
        v-model="dateModel"
        class="max-w-[150px] rounded-none"
        :class="props.classes"
        input-class-name="!border-neutral-400 dark:!border-neutral-700"
        auto-apply
        :clearable="props.clearable"
        :enable-time-picker="props.enableTime"
        :max-date="props.maxDate"
        :min-date="props.minDate"
        :uid="inputUid"
        :dark="props.dark"
    />
</template>
<style scoped>
:deep(.dp__input) {
    @apply rounded-none border-x-0 border-t-0 min-w-[150px] w-full h-10 
    !border-b-2 focus:outline-none focus:border-neutral-500
    bg-transparent
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