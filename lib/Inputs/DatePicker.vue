<script setup lang="ts">
import { ref, watch } from 'vue'
import uid from '../Utilities/uid'
import Tooltip from '../Tooltip.vue'
import '@vuepic/vue-datepicker/dist/main.css'
import VueDatePicker from '@vuepic/vue-datepicker'
import FasCircleQuestion from '../Icons/FasCircleQuestion.vue'

interface Props {
    modelValue: Date | null,
    enableTime?: boolean,
    maxDate?: Date,
    minDate?: Date,
    clearable?: boolean,
    classes?: string | object | any[],
    label?: string,
    showValidated?: boolean,
    labelStyles?: any,
    tooltip?: string,
    tooltipHeader?: string,
    placeholder?: string,
    dark?: boolean,
    renderLabel?: boolean,
}
const props = withDefaults(defineProps<Props>(), {
    clearable: false,
    enableTime: false,
    showValidated: false,
    dark: false,
    renderLabel: true,
})
const emit = defineEmits(['update:modelValue'])

const dateModel = ref(props.modelValue)
const inputUid = uid()

watch(dateModel, () => emit('update:modelValue', dateModel.value))
watch(props, () => dateModel.value = props.modelValue)

</script>
<template>
    <div class="flex flex-col">
        <label v-if="renderLabel"
            class="text-[13px] hover:cursor-text text-black font-bold delay-0 transform transition-all"
            :class="[
                {'invisible':  !props.label},
                props.labelStyles
            ]"
            :for="inputUid"
        >
            {{ props.label ?? 'invisible' }}

            <Tooltip v-if="$slots.tooltip">
                <template v-if="$slots.tooltipHeader" #header>
                    <slot name="tooltipHeader" />
                </template>
                <template #tooltip>
                    <slot v-if="$slots.tooltip" name="tooltip" />
                </template>
                <FasCircleQuestion />
            </Tooltip>
            
        </label>
    </div>
    <VueDatePicker
        v-bind="$attrs"
        v-model="dateModel"
        class="max-w-[150px] rounded-none"
        :class="props.classes"
        :input-class-name="`!border-neutral-400 ${props.dark ? '!border-neutral-700' : ''}`"
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