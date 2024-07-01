<script setup lang="ts">
import { ref, watch } from 'vue'
import uid from '../Utilities/uid'
import '@vuepic/vue-datepicker/dist/main.css'
import VueDatePicker from '@vuepic/vue-datepicker'
import GlobalLabel from './Partials/GlobalLabel.vue'
import { type ValidationState } from './Partials/InputProps'

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
    placeholder?: string,
    allowTextInput?: boolean,
    resetable?: boolean,
    optional?: boolean,
    dark?: boolean,
    renderLabel?: boolean,
    validationState?: ValidationState
}
const props = withDefaults(defineProps<Props>(), {
    clearable: false,
    enableTime: false,
    showValidated: false,
    allowTextInput: true,
    renderLabel: false,
    optional: false,
    resetable: true,
    dark: false,
})
const emit = defineEmits(['update:modelValue'])

const inputUid = uid()

const dateModel = ref(props.modelValue)
const defaultValue = ref(props.resetable ? props.modelValue : undefined)

watch(dateModel, () => emit('update:modelValue', dateModel.value))
watch(props, () => dateModel.value = props.modelValue)

const reset = () => {
    if (defaultValue.value) dateModel.value = defaultValue.value
    emit('update:modelValue', dateModel.value)
}

const clear = () => {
    dateModel.value = null
    emit('update:modelValue', dateModel.value)
}

</script>
<template>
    <div class="flex flex-col group">
        <GlobalLabel v-if="$slots.label || props.renderLabel"
            :input-uid="inputUid"
            :label-styles="props.labelStyles"
            :optional="props.optional"
            :has-value="Boolean(dateModel)"
            :has-default-value="props.resetable ? Boolean(defaultValue) : false"
            :value-is-defaulted="dateModel === defaultValue"
            :validation-state="props.validationState"
            :dark="props.dark"
            @reset="reset"
            @clear="clear"
        >
            <template v-if="$slots.label" #label>
                <slot name="label" />
            </template>
            <template v-if="$slots.tooltipHeader" #tooltipHeader>
                <slot name="tooltipHeader" />
            </template>
            <template v-if="$slots.tooltip"  #tooltip>
                <slot name="tooltip" />
            </template>
        </GlobalLabel>

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
    </div>
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